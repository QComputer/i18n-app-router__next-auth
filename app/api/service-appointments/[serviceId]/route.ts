/**
 * Service Appointments API Route
 * 
 * GET /api/service-appointments/[serviceId]
 * Returns paginated appointments for a specific service
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { serviceId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Verify the service exists and user has access
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        staff: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this service's organization
    if (service.staff.organizationId !== session.user.organizationId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const skip = (page - 1) * limit

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          serviceId,
        },
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
        include: {
          service: {
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
          },
        },
      }),
      prisma.appointment.count({
        where: {
          serviceId,
        },
      }),
    ])

    // Serialize dates for JSON response
    const serializedAppointments = appointments.map((appointment) => ({
      ...appointment,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      appointments: serializedAppointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching service appointments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
