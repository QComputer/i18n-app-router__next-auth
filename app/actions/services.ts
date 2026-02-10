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

/**
 * Create a new service for the organization
 */
export async function createServiceAction(formData: FormData, locale: string) {
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  const organizationId = session.user.organizationId
  
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const duration = parseInt(formData.get("duration") as string) || 30
  const price = parseFloat(formData.get("price") as string) || null
  const color = formData.get("color") as string || "#0ea5e9"

  if (!name || name.trim() === "") {
    throw new Error("Service name is required")
  }

  await prisma.service.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      duration,
      price,
      color,
      organizationId,
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
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  const organizationId = session.user.organizationId
  
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Verify service belongs to user's organization
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service || service.organizationId !== organizationId) {
    redirect(`/${locale}/services`)
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const duration = parseInt(formData.get("duration") as string) || 30
  const price = parseFloat(formData.get("price") as string) || null

  if (!name || name.trim() === "") {
    throw new Error("Service name is required")
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      duration,
      price,
    },
  })

  revalidatePath(`/${locale}/services`)
  revalidatePath(`/${locale}/services/${serviceId}`)
  redirect(`/${locale}/services/${serviceId}`)
}

/**
 * Soft delete a service (set isActive to false)
 */
export async function deleteServiceAction(serviceId: string, locale: string) {
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  const organizationId = session.user.organizationId
  
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Verify service belongs to user's organization
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service || service.organizationId !== organizationId) {
    redirect(`/${locale}/services`)
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  })

  revalidatePath(`/${locale}/services`)
  redirect(`/${locale}/services`)
}
