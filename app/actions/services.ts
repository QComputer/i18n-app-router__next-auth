"use server";

/**
 * Service Management Server Actions
 * 
 * Provides server-side CRUD operations for managing services.
 * These actions are accessible to authenticated STAFF and ADMIN users.
 */

import prisma from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isAdmin, isOrganizationAdmin, requireStaff } from "@/lib/auth/admin";

/**
 * Create a new service for the organization
 */
export async function createServiceAction(formData: FormData, locale: string) {
  const user = await requireStaff();
  
  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  const currentStaffId = user.staffId 
  const organizationId = user.organizationId
  
  if (!currentStaffId || !organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Use user's staff hierarchy to determine if they can assign to other staff
  
  const currentHierarchy = user.hierarchy || user.role

  // Determine which staffId to use for the service
  // OWNER/MANAGER can assign services to other staff, others use their own staffId
  let serviceStaffId = currentStaffId
  const submittedStaffId = formData.get("staffId") as string
  
  if (isOrganizationAdmin(currentHierarchy) && submittedStaffId) {
    // Verify the submitted staff belongs to the same organization
    const targetStaff = await prisma.staff.findUnique({
      where: { id: submittedStaffId },
      select: { organizationId: true },
    })
    
    if (targetStaff?.organizationId === organizationId) {
      serviceStaffId = submittedStaffId
    }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const duration = parseInt(formData.get("duration") as string) || 30
  const price = parseFloat(formData.get("price") as string) || null
  const color = formData.get("color") as string || "#0ea5e9"
  const serviceCategoryId = formData.get("serviceCategoryId") as string

  if (!name || name.trim() === "") {
    throw new Error("Service name is required")
  }

  // If no service category is selected, create or get a default category
  let categoryId = serviceCategoryId
  
  if (!categoryId) {
    // Check if there's an existing default category
    const existingCategory = await prisma.serviceCategory.findFirst({
      where: { organizationId },
      orderBy: { name: "asc" },
    })

    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      // Create a default category
      const newCategory = await prisma.serviceCategory.create({
        data: {
          name: "General",
          description: "General services",
          organizationId,
        },
      })
      categoryId = newCategory.id
    }
  }

  await prisma.service.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      duration,
      price,
      color,
      staffId: serviceStaffId,
      serviceCategoryId: categoryId,
    },
  })

  revalidatePath(`/${locale}/services`)
  redirect(`/${locale}/services`)
}

/**
 * Update an existing service
 */
export async function updateServiceAction(
  serviceId: string,
  formData: FormData,
  locale: string
) {
  const user = await requireStaff();
  
  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  const currentStaffId = user.staffId
  const currentHierarchy = user.hierarchy || user.role
  const organizationId = user.organizationId
  const userRole = user.role
  
  if (!currentStaffId || !organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Get user's staff hierarchy
  const currentStaff = await prisma.staff.findUnique({
    where: { id: currentStaffId },
    select: { hierarchy: true },
  })

  // Verify permission: user is either the service owner, or is OWNER/ADMIN
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        select: { organizationId: true },
      },
    },
  })

  if (!service) {
    redirect(`/${locale}/services`)
  }

  // Check if user has permission to update this service
  const isOwner = service.staffId === currentStaffId
  const isOrgOwner = currentStaff?.hierarchy === "OWNER" && service.staff.organizationId === organizationId

  if (!isOwner && !isOrgOwner && !isAdmin(userRole)) {
    redirect(`/${locale}/services`)
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const duration = parseInt(formData.get("duration") as string) || 30
  const price = parseFloat(formData.get("price") as string) || null
  const serviceCategoryId = formData.get("serviceCategoryId") as string
  const submittedStaffId = formData.get("staffId") as string

  if (!name || name.trim() === "") {
    throw new Error("Service name is required")
  }

  // Build update data
  const updateData: Record<string, unknown> = {
    name: name.trim(),
    description: description?.trim() || null,
    duration,
    price,
  }

  // Update serviceCategoryId if provided
  if (serviceCategoryId) {
    updateData.serviceCategoryId = serviceCategoryId
  }

  // Update staffId if provided and user is OWNER/MANAGER/ADMIN
  if (isOrganizationAdmin(currentHierarchy) && submittedStaffId) {
    // Verify the submitted staff belongs to the same organization
    const targetStaff = await prisma.staff.findUnique({
      where: { id: submittedStaffId },
      select: { organizationId: true },
    })
    
    if (targetStaff?.organizationId === organizationId) {
      updateData.staffId = submittedStaffId
    }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: updateData,
  })

  revalidatePath(`/${locale}/services`)
  revalidatePath(`/${locale}/services/${serviceId}`)
  redirect(`/${locale}/services/${serviceId}`)
}

/**
 * Soft delete a service (set isActive to false)
 */
export async function deleteServiceAction(serviceId: string, locale: string) {
  const user = await requireStaff();
  
  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  const staffId = user.staffId
  const hierarchy = user.hierarchy || user.role
  const organizationId = user.organizationId
  
  if (!staffId || !organizationId || !hierarchy) {
    redirect(`/${locale}/dashboard`)
  }

  // Verify permission: user is either the service owner, or is OWNER/ADMIN
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        select: { organizationId: true },
      },
    },
  })

  if (!service) {
    redirect(`/${locale}/services`)
  }

  // Check if user has permission to delete this service
  const isOwner = service.staffId === staffId
  const isOrgOwner = isOrganizationAdmin(hierarchy) && service.staff.organizationId === organizationId

  if (!isOwner && !isOrgOwner && !isAdmin(hierarchy)) {
    redirect(`/${locale}/services`)
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  })

  revalidatePath(`/${locale}/services`)
  redirect(`/${locale}/services`)
}
