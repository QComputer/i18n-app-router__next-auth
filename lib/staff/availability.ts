/**
 * Staff Availability Utility
 * 
 * Utilities for managing staff-specific availability schedules.
 */

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

/**
 * Day of week mapping
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun", fa: "یکشنبه" },
  { value: 1, label: "Monday", short: "Mon", fa: "دوشنبه" },
  { value: 2, label: "Tuesday", short: "Tue", fa: "سه‌شنبه" },
  { value: 3, label: "Wednesday", short: "Wed", fa: "چهارشنبه" },
  { value: 4, label: "Thursday", short: "Thu", fa: "پنج‌شنبه" },
  { value: 5, label: "Friday", short: "Fri", fa: "جمعه" },
  { value: 6, label: "Saturday", short: "Sat", fa: "شنبه" },
];

/**
 * Get staff availability schedule
 */
export async function getStaffAvailability(staffId: string) {
  const availability = await prisma.staffAvailability.findMany({
    where: { staffId },
    orderBy: { dayOfWeek: "asc" },
  });

  return availability;
}

/**
 * Get effective availability for a staff member
 * Falls back to organization hours if staff-specific hours not set
 */
export async function getEffectiveAvailability(
  staffId: string,
  organizationId: string,
  date: Date
) {
  const dayOfWeek = date.getDay();

  // Try to get staff-specific availability first
  const staffAvailability = await prisma.staffAvailability.findUnique({
    where: {
      staffId_dayOfWeek: {
        staffId,
        dayOfWeek,
      },
    },
  });

  if (staffAvailability && staffAvailability.isActive) {
    return {
      startTime: staffAvailability.startTime,
      endTime: staffAvailability.endTime,
      isStaffSpecific: true,
    };
  }

  // Fall back to organization business hours
  const orgBusinessHours = await prisma.businessHours.findUnique({
    where: {
      organizationId_dayOfWeek: {
        organizationId,
        dayOfWeek,
      },
    },
  });

  if (orgBusinessHours && orgBusinessHours.isActive) {
    return {
      startTime: orgBusinessHours.startTime,
      endTime: orgBusinessHours.endTime,
      isStaffSpecific: false,
    };
  }

  // No availability for this day
  return null;
}

/**
 * Update staff availability
 */
export async function updateStaffAvailability(
  staffId: string,
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>
) {
  // Delete existing availability
  await prisma.staffAvailability.deleteMany({
    where: { staffId },
  });

  // Create new availability
  if (schedule.length > 0) {
    await prisma.staffAvailability.createMany({
      data: schedule.map((slot) => ({
        staffId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
      })),
    });
  }

  return { success: true };
}

/**
 * Check if staff is available at a given time
 */
export async function isStaffAvailable(
  staffId: string,
  organizationId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  // Check effective availability for the day
  const effectiveAvailability = await getEffectiveAvailability(
    staffId,
    organizationId,
    startTime
  );

  if (!effectiveAvailability) {
    return false;
  }

  // Parse availability hours
  const [startHour, startMinute] = effectiveAvailability.startTime.split(":").map(Number);
  const [endHour, endMinute] = effectiveAvailability.endTime.split(":").map(Number);

  const availStart = new Date(startTime);
  availStart.setHours(startHour, startMinute, 0, 0);

  const availEnd = new Date(startTime);
  availEnd.setHours(endHour, endMinute, 0, 0);

  // Check if appointment is within availability window
  if (startTime < availStart || endTime > availEnd) {
    return false;
  }

  // Check for conflicting appointments
  const whereClause: Record<string, unknown> = {
    service: {
      staffId,
    },
    status: { notIn: ["CANCELLED"] },
    OR: [
      {
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    ],
  };

  if (excludeAppointmentId) {
    whereClause.id = { not: excludeAppointmentId };
  }

  const conflicts = await prisma.appointment.count({
    where: whereClause,
  });

  return conflicts === 0;
}

/**
 * Get available time slots for a staff member
 */
export async function getAvailableSlots(
  staffId: string,
  organizationId: string,
  date: Date,
  serviceDuration: number,
  slotInterval: number = 30,
  excludeAppointmentId?: string
): Promise<Array<{ time: string; label: string; available: boolean }>> {
  const effectiveAvailability = await getEffectiveAvailability(
    staffId,
    organizationId,
    date
  );

  if (!effectiveAvailability) {
    return [];
  }

  // Parse availability hours
  const [startHour, startMinute] = effectiveAvailability.startTime.split(":").map(Number);
  const [endHour, endMinute] = effectiveAvailability.endTime.split(":").map(Number);

  const availStart = new Date(date);
  availStart.setHours(startHour, startMinute, 0, 0);

  const availEnd = new Date(date);
  availEnd.setHours(endHour, endMinute, 0, 0);

  // Get existing appointments for the day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      service: {
        staffId,
      },
      status: { notIn: ["CANCELLED"] },
      startTime: { gte: dayStart, lte: dayEnd },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
    },
    orderBy: { startTime: "asc" },
  });

  // Generate slots
  const slots: Array<{ time: string; label: string; available: boolean }> = [];
  let currentSlot = new Date(availStart);

  while (currentSlot < availEnd) {
    const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);

    // Check if slot fits within availability
    if (slotEnd > availEnd) {
      break;
    }

    // Check for conflicts
    const hasConflict = existingAppointments.some((apt) => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return currentSlot < aptEnd && slotEnd > aptStart;
    });

    const timeStr = `${currentSlot.getHours().toString().padStart(2, "0")}:${currentSlot.getMinutes().toString().padStart(2, "0")}`;
    const label = `${timeStr} - ${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd.getMinutes().toString().padStart(2, "0")}`;

    slots.push({
      time: timeStr,
      label,
      available: !hasConflict,
    });

    // Move to next slot
    currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000);
  }

  return slots;
}

/**
 * Get week schedule summary
 */
export async function getWeekScheduleSummary(staffId: string, organizationId: string) {
  const summary: Array<{
    dayOfWeek: number;
    dayName: string;
    shortName: string;
    isAvailable: boolean;
    hours: string;
  }> = [];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);

    const availability = await getEffectiveAvailability(staffId, organizationId, dayDate);
    const dayInfo = DAYS_OF_WEEK[dayDate.getDay()];

    summary.push({
      dayOfWeek: dayDate.getDay(),
      dayName: dayInfo.label,
      shortName: dayInfo.short,
      isAvailable: availability !== null,
      hours: availability
        ? `${availability.startTime} - ${availability.endTime}`
        : "Not available",
    });
  }

  return summary;
}
