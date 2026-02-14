"use server";

/**
 * Appointments Management Server Actions
 *
 * Provides server-side CRUD operations for managing appointments based on user role and hierarchy.
 * - OWNER and MANAGER users can view all organization-wide appointments and services
 * - STAFF users can only access their own respective appointments and services
 */

import prisma from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

/**
 * Get appointments based on user role and hierarchy
 */
export async function getAppointments(params: {
  status?: string
  serviceId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
  search?: string
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/auth/signin`)
  }

  const {
    status,
    serviceId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    search = "",
  } = params

  // Only STAFF users with organizationId can access appointments
  if (!session.user.organizationId) {
    return {
      appointments: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const where: Record<string, any> = {
    organizationId: session.user.organizationId,
  }

  // Filter by status if provided
  if (status) {
    where.status = status
  }

  // Filter by service if provided
  if (serviceId) {
    where.serviceId = serviceId
  }

  // Filter by date range if provided
  if (startDate || endDate) {
    where.startTime = {}
    if (startDate) {
      where.startTime.gte = startDate
    }
    if (endDate) {
      where.startTime.lte = endDate
    }
  }

  // Search functionality
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { clientEmail: { contains: search, mode: "insensitive" } },
      { clientPhone: { contains: search, mode: "insensitive" } },
    ]
  }

  // For STAFF users (MERCHANT hierarchy), only show their own appointments
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    where.staffId = session.user.staffId
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
            color: true,
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
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/auth/signin`)
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      staff: {
        include: {
          user: true,
        },
      },
    },
  })

  // Check if appointment belongs to user's organization
  if (!appointment || appointment.organizationId !== session.user.organizationId) {
    return null
  }

  // For STAFF users (MERCHANT hierarchy), check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (appointment.staffId !== session.user.staffId) {
      return null
    }
  }

  return appointment
}

/**
 * Create a new appointment
 */
export async function createAppointmentAction(formData: FormData, locale: string) {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/${locale}/auth/signin`)
  }

  const serviceId = formData.get("serviceId") as string
  const clientName = formData.get("clientName") as string
  const clientEmail = formData.get("clientEmail") as string
  const clientPhone = formData.get("clientPhone") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const notes = formData.get("notes") as string
  const staffId = formData.get("staffId") as string || undefined

  // Validate required fields
  if (!serviceId || !clientName || !date || !time) {
    throw new Error("Required fields are missing")
  }

  // Get service for duration
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        include: {
          organization: true,
        },
      },
    },
  })

  if (!service || service.staff.organizationId !== session.user.organizationId) {
    throw new Error("Service not found")
  }

  // Calculate start and end times
  const [hours, minutes] = time.split(":").map(Number)
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  const endTime = new Date(startTime.getTime() + service.duration * 60000)

  // For STAFF users (MERCHANT hierarchy), only allow booking for themselves
  let assignedStaffId = staffId
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    assignedStaffId = session.user.staffId
  }

  const appointment = await prisma.appointment.create({
    data: {
      organizationId: session.user.organizationId,
      serviceId,
      clientId: session.user.id,
      clientName,
      clientEmail,
      clientPhone,
      staffId: assignedStaffId,
      startTime,
      endTime,
      notes,
      status: "PENDING",
    },
  })

  revalidatePath(`/${locale}/appointments`)
  redirect(`/${locale}/appointments`)
}

/**
 * Update an existing appointment
 */
export async function updateAppointmentAction(
  id: string,
  locale: string,
  formData: FormData
) {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/${locale}/auth/signin`)
  }

  // Get existing appointment
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!existingAppointment || existingAppointment.organizationId !== session.user.organizationId) {
    redirect(`/${locale}/appointments`)
  }

  // For STAFF users (MERCHANT hierarchy), check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (existingAppointment.staffId !== session.user.staffId) {
      redirect(`/${locale}/appointments`)
    }
  }

  const serviceId = formData.get("serviceId") as string
  const clientName = formData.get("clientName") as string
  const clientEmail = formData.get("clientEmail") as string
  const clientPhone = formData.get("clientPhone") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const notes = formData.get("notes") as string
  const staffId = formData.get("staffId") as string || undefined

  // Get service for duration
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        include: {
          organization: true,
        },
      },
    },
  })

  if (!service || service.staff.organizationId !== session.user.organizationId) {
    throw new Error("Service not found")
  }

  // Calculate start and end times
  const [hours, minutes] = time.split(":").map(Number)
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  const endTime = new Date(startTime.getTime() + service.duration * 60000)

  // For STAFF users (MERCHANT hierarchy), only allow updating to themselves
  let assignedStaffId = staffId
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    assignedStaffId = session.user.staffId
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      staffId: assignedStaffId,
      startTime,
      endTime,
      notes,
    },
  })

  revalidatePath(`/${locale}/appointments`)
  revalidatePath(`/${locale}/appointments/${id}`)
  redirect(`/${locale}/appointments/${id}`)
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  reason?: string
) {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/auth/signin`)
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!appointment || appointment.organizationId !== session.user.organizationId) {
    throw new Error("Appointment not found")
  }

  // For STAFF users (MERCHANT hierarchy), check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (appointment.staffId !== session.user.staffId) {
      throw new Error("Not authorized to update this appointment")
    }
  }

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
 * Cancel appointment action
 */
export async function cancelAppointmentAction(
  id: string,
  locale: string,
  formData: FormData
) {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/${locale}/auth/signin`)
  }

  const reason = formData.get("reason") as string
  const confirm = formData.get("confirm")

  // Validate confirmation checkbox
  if (!confirm || confirm !== "true") {
    throw new Error("Confirmation is required to cancel the appointment")
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!appointment || appointment.organizationId !== session.user.organizationId) {
    throw new Error("Appointment not found")
  }

  // For STAFF users (MERCHANT hierarchy), check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (appointment.staffId !== session.user.staffId) {
      throw new Error("Not authorized to cancel this appointment")
    }
  }

  // Check if appointment can be cancelled
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    throw new Error("This appointment cannot be cancelled")
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
    },
  })

  revalidatePath(`/${locale}/appointments`)
  revalidatePath(`/${locale}/appointments/${id}`)
  redirect(`/${locale}/appointments/${id}`)
}

/**
 * Delete an appointment
 */
export async function deleteAppointmentAction(id: string, locale: string) {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    redirect(`/${locale}/auth/signin`)
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!appointment || appointment.organizationId !== session.user.organizationId) {
    redirect(`/${locale}/appointments`)
  }

  // For STAFF users (MERCHANT hierarchy), check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (appointment.staffId !== session.user.staffId) {
      redirect(`/${locale}/appointments`)
    }
  }

  await prisma.appointment.delete({
    where: { id },
  })

  revalidatePath(`/${locale}/appointments`)
  redirect(`/${locale}/appointments`)
}

/**
 * Get services based on user role and hierarchy
 */
export async function getServicesForUser() {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    return []
  }

  // All users in organization can see active services
  const services = await prisma.service.findMany({
    where: {
      staff: {
        organizationId: session.user.organizationId,
      },
      isActive: true,
    },
    orderBy: { name: "asc" },
  })

  return services
}

/**
 * Get staff members based on user role and hierarchy
 */
export async function getStaffForUser() {
  const session = await auth()
  
  if (!session?.user || !session.user.organizationId) {
    return []
  }

  // For STAFF users (MERCHANT hierarchy), only show themselves
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    const staff = await prisma.staff.findUnique({
      where: { id: session.user.staffId },
      include: {
        user: true,
      },
    })

    return staff ? [staff] : []
  }

  // For OWNER and MANAGER, show all active staff
  const staff = await prisma.staff.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    include: {
      user: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  })

  return staff
}
