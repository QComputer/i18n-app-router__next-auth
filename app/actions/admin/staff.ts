"use server";

/**
 * Admin Staff Management Server Actions
 * 
 * Provides server-side CRUD operations for managing staff members with admin privileges.
 * These actions are only accessible to authenticated admin users.
 */

import prisma from "@/lib/db/prisma"
import { requireAdmin, requireOrganizationAdmin } from "@/lib/auth/admin"

/**
 * Get all staff members across all organizations with optional filtering and pagination
 */
export async function getAllStaff(params: {
  active?: boolean
  organizationId?: string
  page?: number
  limit?: number
  search?: string
}) {
  await requireOrganizationAdmin()

  const {
    active,
    organizationId,
    page = 1,
    limit = 50,
    search = "",
  } = params

  const where: Record<string, any> = {}

  if (active !== undefined) {
    where.isActive = active
  }

  if (organizationId) {
    where.organizationId = organizationId
  }

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ],
    }
  }

  const skip = (page - 1) * limit

  const [staffs, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        organization: true,
      },
    }),
    prisma.staff.count({ where }),
  ])

  return {
    staffs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(id: string) {
  await requireOrganizationAdmin()

  return prisma.staff.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
      appointments: {
        include: {
          service: true,
        },
      },
    },
  })
}

/**
 * Create a new staff member (links user to organization)
 */
export async function createStaff(data: {
  userId: string
  organizationId: string
  hierarchy: 'OWNER' | 'MANAGER' | 'MERCHANT'
  bio?: string
  isActive?: boolean
  isDefault?: boolean
}) {
  await requireAdmin()

  const {
    userId,
    organizationId,
    hierarchy = "MERCHANT",
    bio,
    isActive = true,
    isDefault = false,
  } = data

  // If making this staff the default, ensure no other staff in the organization is default
  const createData: any = {
    userId,
    organizationId,
    hierarchy,
    bio: bio || null,
    isActive,
    isDefault,
  }

  if (isDefault) {
    // First, remove default status from other staff in the same organization
    await prisma.staff.updateMany({
      where: {
        organizationId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })
  }

  return prisma.staff.create({
    data: createData,
    include: {
      user: true,
      organization: true,
    },
  })
}

/**
 * Update staff details
 */
export async function updateStaff(id: string, data: Partial<{
  hierarchy?: 'OWNER' | 'MANAGER' | 'MERCHANT'
  bio?: string
  isActive?: boolean
  isDefault?: boolean
}>) {
  await requireAdmin()

  const updateData: Record<string, any> = { ...data }

  // If making this staff the default, ensure no other staff in the organization is default
  if (updateData.isDefault) {
    const staff = await prisma.staff.findUnique({
      where: { id },
    })

    if (staff) {
      await prisma.staff.updateMany({
        where: {
          organizationId: staff.organizationId,
          id: { not: id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }
  }

  return prisma.staff.update({
    where: { id },
    data: updateData,
    include: {
      user: true,
      organization: true,
    },
  })
}

/**
 * Delete a staff member (soft delete or hard delete)
 */
export async function deleteStaff(id: string, hardDelete = false) {
  await requireAdmin()

  if (hardDelete) {
    return prisma.staff.delete({
      where: { id },
    })
  }

  return prisma.staff.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Toggle staff active/inactive status
 */
export async function toggleStaffStatus(id: string, isActive: boolean) {
  await requireAdmin()

  return prisma.staff.update({
    where: { id },
    data: { isActive },
  })
}
