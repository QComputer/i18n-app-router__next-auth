import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, name, phone, email, date, time, notes, serviceId } = body

    // Validate required fields
    if (!organizationId || !name || !phone || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Combine date and time into startTime
    const startTime = new Date(`${date}T${time}:00`)
    
    // Default to 30 minute appointment if no service selected
    const endTime = new Date(startTime.getTime() + 30 * 60000)

    // Get default service if not provided
    let finalServiceId = serviceId
    if (!finalServiceId) {
      const defaultService = await prisma.service.findFirst({
        where: { 
          organizationId,
          isActive: true
        },
        orderBy: { createdAt: 'asc' }
      })
      finalServiceId = defaultService?.id || null
    }

    // Create appointment request
    const appointment = await prisma.appointment.create({
      data: {
        organizationId,
        clientName: name,
        clientPhone: phone,
        clientEmail: email || null,
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
        serviceId: finalServiceId,
        clientId: null, // Will be set if user is authenticated
      },
    })

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error creating visitor appointment:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}
