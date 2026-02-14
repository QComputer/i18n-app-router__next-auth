"use server";

/**
 * Service Category Management Server Actions
 * 
 * Provides server-side CRUD operations for managing service categories.
 * These actions are accessible to authenticated OWNER and ADMIN users.
 */

import prisma from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

/**
 * Create a new service category for the organization
 */
export async function createServiceCategoryAction(
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

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name || name.trim() === "") {
    throw new Error("Category name is required")
  }

  await prisma.serviceCategory.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      organizationId,
    },
  })

  revalidatePath(`/${locale}/settings/organization/categories`)
  redirect(`/${locale}/settings/organization/categories`)
}

/**
 * Update an existing service category
 */
export async function updateServiceCategoryAction(
  categoryId: string,
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

  // Verify category belongs to user's organization
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category || category.organizationId !== organizationId) {
    redirect(`/${locale}/settings/organization/categories`)
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name || name.trim() === "") {
    throw new Error("Category name is required")
  }

  await prisma.serviceCategory.update({
    where: { id: categoryId },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  })

  revalidatePath(`/${locale}/settings/organization/categories`)
  redirect(`/${locale}/settings/organization/categories`)
}

/**
 * Delete a service category
 */
export async function deleteServiceCategoryAction(
  categoryId: string,
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

  // Verify category belongs to user's organization
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category || category.organizationId !== organizationId) {
    redirect(`/${locale}/settings/organization/categories`)
  }

  // Check if there are services using this category
  const servicesCount = await prisma.service.count({
    where: { serviceCategoryId: categoryId },
  })

  if (servicesCount > 0) {
    throw new Error("Cannot delete category with existing services. Please remove or reassign services first.")
  }

  await prisma.serviceCategory.delete({
    where: { id: categoryId },
  })

  revalidatePath(`/${locale}/settings/organization/categories`)
  redirect(`/${locale}/settings/organization/categories`)
}

/**
 * Get all service categories for an organization
 */
export async function getServiceCategoriesByOrganization(
  organizationId: string | null
) {
  if (!organizationId) {
    return []
  }

  return prisma.serviceCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { services: true },
      },
    },
  })
}
