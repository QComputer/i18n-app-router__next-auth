/**
 * Service Library
 * 
 * Provides CRUD operations for services.
 */

import prisma from "@/lib/db/prisma"

/**
 * Service type definition
 */
export type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  currency: string
  color: string | null
  slotInterval: number
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new service
 */
export async function createService(data: {
  name: string
  description?: string
  duration: number
  price?: number
  organizationId: string
}): Promise<Service> {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description || null,
      duration: data.duration,
      price: data.price || null,
      organizationId: data.organizationId,
    },
  })
}

/**
 * Get a service by ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  return prisma.service.findUnique({
    where: { id },
  })
}

/**
 * Get all services for an organization
 */
export async function getServicesByOrganization(
  organizationId: string | null,
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<Service[]> {
  // If no organization ID, return empty array
  if (!organizationId) {
    return []
  }

  const where: Record<string, unknown> = {
    organizationId,
  }

  if (!options?.includeInactive) {
    where.isActive = true
  }

  return prisma.service.findMany({
    where,
    orderBy: { name: "asc" },
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Update a service
 */
export async function updateService(
  id: string,
  data: {
    name?: string
    description?: string
    duration?: number
    price?: number
    isActive?: boolean
  }
): Promise<Service> {
  return prisma.service.update({
    where: { id },
    data,
  })
}

/**
 * Delete a service (soft delete by setting isActive to false)
 */
export async function deleteService(id: string): Promise<Service> {
  return prisma.service.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Hard delete a service (permanent)
 */
export async function hardDeleteService(id: string): Promise<void> {
  await prisma.service.delete({
    where: { id },
  })
}

/**
 * Count services for an organization
 */
export async function countServices(
  organizationId: string,
  includeInactive = false
): Promise<number> {
  const where: Record<string, unknown> = {
    organizationId,
  }

  if (!includeInactive) {
    where.isActive = true
  }

  return prisma.service.count({ where })
}

/**
 * Search services by name
 */
export async function searchServices(
  organizationId: string,
  query: string
): Promise<Service[]> {
  return prisma.service.findMany({
    where: {
      organizationId,
      isActive: true,
      name: {
        contains: query,
      },
    },
    orderBy: { name: "asc" },
  })
}
