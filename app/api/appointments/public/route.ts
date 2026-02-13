/**
 * Public Appointment Booking API Route
 * 
 * API endpoint for creating appointments without authentication.
 * This allows visitors to book appointments directly from the public service menu page.
 */

import prisma from "@/lib/db/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

// Validation schema
const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().optional(),
  staffId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = appointmentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { 
      serviceId, 
      date, 
      time, 
      clientName, 
      clientPhone, 
      clientEmail, 
      notes,
      staffId 
    } = validation.data

    // Get service to validate and get organization
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        duration: true,
        organizationId: true,
        staffId: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Parse date and time
    const appointmentDate = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    
    if (isNaN(appointmentDate.getTime()) || isNaN(hours) || isNaN(minutes)) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      )
    }

    // Set the appointment time
    appointmentDate.setHours(hours, minutes, 0, 0)
    
    // Calculate end time based on service duration
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000)

    // Use the staffId from the request or fall back to service's staffId
    const effectiveStaffId = staffId || service.staffId

    // Check for conflicts
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId: effectiveStaffId,
        status: { notIn: ["CANCELLED"] },
        OR: [
          {
            // Check if new appointment overlaps with existing
            AND: [
              { startTime: { lte: appointmentDate } },
              { endTime: { gt: appointmentDate } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: appointmentDate } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please select another time." },
        { status: 409 }
      )
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        startTime: appointmentDate,
        endTime: endTime,
        status: "PENDING",
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        notes: notes || null,
        serviceId: service.id,
        organizationId: service.organizationId,
        staffId: effectiveStaffId,
      },
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
      },
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}
