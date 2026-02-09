"use server";

/**
 * Admin Services Management Server Actions
 * 
 * Provides server-side CRUD operations for managing services across all organizations with admin privileges.
 * These actions are only accessible to authenticated admin users.
 */

import prisma from "@/lib/db/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { requireAdmin } from "@/lib/auth/admin"

/**
 * Get all services across all organizations with optional filtering and pagination
 */
export async function getAllServices(params: {
  active?: boolean
  organizationId?: string
  page?: number
  limit?: number
  search?: string
}) {
  await requireAdmin()

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
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ])

  return {
    services,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string) {
  await requireAdmin()

  return prisma.service.findUnique({
    where: { id },
    include: {
      organization: true,
      appointments: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

/**
 * Create a new service
 */
export async function createService(data: {
  name: string
  description?: string
  duration: number
  price?: number
  currency?: string
  color?: string
  organizationId: string
}) {
  await requireAdmin()

  const {
    name,
    description,
    duration,
    price,
    currency = "IRR",
    color,
    organizationId,
  } = data

  return prisma.service.create({
    data: {
      name,
      description: description || null,
      duration,
      price: price || null,
      currency,
      color: color || null,
      organizationId,
    },
  })
}

/**
 * Update service details
 */
export async function updateService(id: string, data: Partial<{
  name?: string
  description?: string
  duration?: number
  price?: number
  currency?: string
  color?: string
  isActive?: boolean
  slotInterval?: number
}>) {
  await requireAdmin()

  return prisma.service.update({
    where: { id },
    data,
  })
}

/**
 * Delete a service (soft delete or hard delete)
 */
export async function deleteService(id: string, hardDelete = false) {
  await requireAdmin()

  if (hardDelete) {
    return prisma.service.delete({
      where: { id },
    })
  }

  return prisma.service.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Toggle service active/inactive status
 */
export async function toggleServiceStatus(id: string, isActive: boolean) {
  await requireAdmin()

  return prisma.service.update({
    where: { id },
    data: { isActive },
  })
}

/**
 * Get services count
 */
export async function countServices(includeInactive = false): Promise<number> {
  await requireAdmin()

  const where: Record<string, any> = {}

  if (!includeInactive) {
    where.isActive = true
  }

  return prisma.service.count({ where })
}
