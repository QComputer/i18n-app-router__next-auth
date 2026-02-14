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
  staffId: string
  serviceCategoryId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Service with relations type definition
 */
export type ServiceWithRelations = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  currency: string
  color: string | null
  slotInterval: number
  isActive: boolean
  staffId: string
  serviceCategoryId: string
  createdAt: Date
  updatedAt: Date
  staff: {
    id: string
    user: {
      name: string | null
      email: string | null
    }
  } | null
  serviceCategory: {
    id: string
    name: string
  } | null
}

/**
 * Create a new service
 */
export async function createService(data: {
  name: string
  description?: string
  duration: number
  price?: number
  staffId: string
  serviceCategoryId: string
}): Promise<Service> {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description || null,
      duration: data.duration,
      price: data.price || null,
      staffId: data.staffId,
      serviceCategoryId: data.serviceCategoryId,
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
 * Get a service by ID with relations
 */
export async function getServiceByIdWithRelations(id: string): Promise<ServiceWithRelations | null> {
  return prisma.service.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      serviceCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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

  return prisma.service.findMany({
    where: {
      staff: {
        organizationId,
      },
      ...(!options?.includeInactive && { isActive: true }),
    },
    orderBy: { name: "asc" },
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Get services by staff ID (for staff to manage their own services)
 */
export async function getServicesByStaffId(
  staffId: string | null,
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<ServiceWithRelations[]> {
  if (!staffId) {
    return []
  }

  return prisma.service.findMany({
    where: {
      staffId,
      ...(!options?.includeInactive && { isActive: true }),
    },
    orderBy: { name: "asc" },
    include: {
      staff: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      serviceCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Get all services for an organization including all staff (for OWNER)
 */
export async function getAllServicesByOrganization(
  organizationId: string | null,
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<ServiceWithRelations[]> {
  if (!organizationId) {
    return []
  }

  return prisma.service.findMany({
    where: {
      staff: {
        organizationId,
      },
      ...(!options?.includeInactive && { isActive: true }),
    },
    orderBy: [
      { staff: { user: { name: 'asc' } } },
      { name: 'asc' },
    ],
    include: {
      staff: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      serviceCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Get all services across the system (for ADMIN)
 */
export async function getAllServices(
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<ServiceWithRelations[]> {
  return prisma.service.findMany({
    where: {
      ...(!options?.includeInactive && { isActive: true }),
    },
    orderBy: [
      { staff: { organization: { name: 'asc' } } },
      { staff: { user: { name: 'asc' } } },
      { name: 'asc' },
    ],
    include: {
      staff: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      serviceCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Appointment type for service appointments
 */
export type ServiceAppointment = {
  id: string
  startTime: Date
  endTime: Date
  status: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  notes: string | null
  serviceId: string
  staffId: string | null
  clientId: string | null
  createdAt: Date
  updatedAt: Date
  staff: {
    id: string
    user: {
      name: string | null
    }
  } | null
}

/**
 * Get appointments for a specific service with pagination
 */
export async function getAppointmentsByService(
  serviceId: string,
  options?: {
    page?: number
    limit?: number
    includeInactive?: boolean
  }
): Promise<{
  appointments: ServiceAppointment[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const page = options?.page || 1
  const limit = options?.limit || 10
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    serviceId,
  }

  // Include all statuses by default (including cancelled/completed)
  // unless explicitly filtered

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        staff: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.appointment.count({ where }),
  ])

  return {
    appointments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
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
  return prisma.service.count({
    where: {
      staff: {
        organizationId,
      },
      ...(!includeInactive && { isActive: true }),
    },
  })
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
      staff: {
        organizationId,
      },
      isActive: true,
      name: {
        contains: query,
      },
    },
    orderBy: { name: "asc" },
  })
}
