"use server";

/**
 * Admin Appointments Management Server Actions
 * 
 * Provides server-side CRUD operations for managing appointments across all organizations with admin privileges.
 * These actions are only accessible to authenticated admin users.
 */

import prisma from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/admin"

/**
 * Get all appointments across all organizations with optional filtering and pagination
 */
export async function getAllAppointments(params: {
  status?: string
  organizationId?: string
  serviceId?: string
  clientId?: string
  staffId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
  search?: string
}) {
  await requireAdmin()

  const {
    status,
    organizationId,
    serviceId,
    clientId,
    staffId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    search = "",
  } = params

  const where: Record<string, any> = {}

  if (status) {
    where.status = status
  }

  if (organizationId) {
    where.organizationId = organizationId
  }

  if (serviceId) {
    where.serviceId = serviceId
  }

  if (clientId) {
    where.clientId = clientId
  }

  if (staffId) {
    where.staffId = staffId
  }

  if (startDate || endDate) {
    where.startTime = {}
    if (startDate) {
      where.startTime.gte = startDate
    }
    if (endDate) {
      where.startTime.lte = endDate
    }
  }

  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { clientEmail: { contains: search, mode: "insensitive" } },
      { clientPhone: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: "desc" },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
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
 * Get a single appointment by ID
 */
export async function getAppointmentById(id: string) {
  await requireAdmin()

  return prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      organization: true,
      client: true,
      staff: {
        include: {
          user: true,
        },
      },
    },
  })
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  reason?: string
) {
  await requireAdmin()

  const updateData: Record<string, any> = {
    status,
  }

  if (status === "CANCELLED" && reason) {
    updateData.cancellationReason = reason
  }

  return prisma.appointment.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string) {
  await requireAdmin()

  return prisma.appointment.delete({
    where: { id },
  })
}

/**
 * Get appointments count
 */
export async function countAppointments(params: {
  status?: string
  organizationId?: string
  startDate?: Date
  endDate?: Date
}): Promise<number> {
  await requireAdmin()

  const { status, organizationId, startDate, endDate } = params

  const where: Record<string, any> = {}

  if (status) {
    where.status = status
  }

  if (organizationId) {
    where.organizationId = organizationId
  }

  if (startDate || endDate) {
    where.startTime = {}
    if (startDate) {
      where.startTime.gte = startDate
    }
    if (endDate) {
      where.startTime.lte = endDate
    }
  }

  return prisma.appointment.count({ where })
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats() {
  await requireAdmin()

  const [
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    todayTotal,
    todayPending,
    todayCompleted,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count({
      where: {
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.appointment.count({
      where: {
        status: "PENDING",
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.appointment.count({
      where: {
        status: "COMPLETED",
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ])

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    todayTotal,
    todayPending,
    todayCompleted,
  }
}
