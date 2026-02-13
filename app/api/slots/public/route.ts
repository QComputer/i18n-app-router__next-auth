/**
 * Public Available Slots API Route
 * 
 * API endpoint for fetching available appointment time slots for public booking.
 * Does not require authentication.
 */

import prisma from "@/lib/db/prisma"
import { getEffectiveAvailability } from "@/lib/staff/availability"
import { NextResponse } from "next/server"

interface TimeSlot {
  time: string
  label: string
  available: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")
    const serviceId = searchParams.get("serviceId")
    const staffId = searchParams.get("staffId")
    const organizationId = searchParams.get("organizationId")
    
    if (!dateStr || !serviceId) {
      return NextResponse.json(
        { error: "Date and service ID are required" },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)
    
    // Get service for duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { 
        duration: true, 
        slotInterval: true,
        staffId: true,
        organizationId: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Use provided organizationId or fall back to service's organizationId
    const effectiveOrganizationId = organizationId || service.organizationId
    
    const slotInterval = service.slotInterval || 30
    const duration = service.duration

    // If staff is selected, get staff-specific availability
    const effectiveStaffId = staffId || service.staffId
    
    if (effectiveStaffId) {
      const availability = await getEffectiveAvailability(
        effectiveStaffId,
        effectiveOrganizationId,
        date
      )

      if (!availability) {
        return NextResponse.json([])
      }

      const slots = await generateSlots(
        date,
        availability.startTime,
        availability.endTime,
        duration,
        slotInterval,
        effectiveStaffId,
        effectiveOrganizationId
      )
      return NextResponse.json(slots)
    }

    // Otherwise, check organization-wide availability
    const effectiveAvailability = await getEffectiveAvailability(
      "",
      effectiveOrganizationId,
      date
    )

    if (!effectiveAvailability) {
      return NextResponse.json([])
    }

    const slots = await generateSlots(
      date,
      effectiveAvailability.startTime,
      effectiveAvailability.endTime,
      duration,
      slotInterval,
      "",
      effectiveOrganizationId
    )

    return NextResponse.json(slots)
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    )
  }
}

async function generateSlots(
  date: Date,
  startTime: string,
  endTime: string,
  duration: number,
  slotInterval: number,
  staffId: string,
  organizationId: string
): Promise<TimeSlot[]> {
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)

  const availStart = new Date(date)
  availStart.setHours(startHour, startMinute, 0, 0)

  const availEnd = new Date(date)
  availEnd.setHours(endHour, endMinute, 0, 0)

  // Get existing appointments for the day
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Build the where clause
  const whereClause: Record<string, unknown> = {
    organizationId,
    status: { notIn: ["CANCELLED"] },
    startTime: { gte: dayStart, lte: dayEnd },
  }
  
  if (staffId) {
    whereClause.staffId = staffId
  }

  const existingAppointments = await prisma.appointment.findMany({
    where: whereClause,
    orderBy: { startTime: "asc" },
  })

  // Generate slots
  const slots: TimeSlot[] = []
  let currentSlot = new Date(availStart)

  while (currentSlot < availEnd) {
    const slotEnd = new Date(currentSlot.getTime() + duration * 60000)

    // Check if slot fits within availability
    if (slotEnd > availEnd) {
      break
    }

    // Check for conflicts
    const hasConflict = existingAppointments.some((apt) => {
      const aptStart = new Date(apt.startTime)
      const aptEnd = new Date(apt.endTime)
      return currentSlot < aptEnd && slotEnd > aptStart
    })

    const hours = currentSlot.getHours().toString().padStart(2, "0")
    const minutes = currentSlot.getMinutes().toString().padStart(2, "0")
    const timeStr = `${hours}:${minutes}`
    
    const endHours = slotEnd.getHours().toString().padStart(2, "0")
    const endMinutes = slotEnd.getMinutes().toString().padStart(2, "0")
    const label = `${timeStr} - ${endHours}:${endMinutes}`

    slots.push({
      time: timeStr,
      label,
      available: !hasConflict,
    })

    // Move to next slot
    currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000)
  }

  return slots
}
