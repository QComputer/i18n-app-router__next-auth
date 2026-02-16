/**
 * Appointment Slot Availability Checker
 * 
 * This module handles all logic related to checking appointment slot availability
 * based on business hours, existing appointments, and holidays.
 * 
 * @module lib/appointments/slots
 */

import prisma from "@/lib/db/prisma"
import { toPersianDigits } from "@/lib/utils"
import { 
  addDays, 
  format, 
  setHours, 
  setMinutes, 
  isBefore, 
  isAfter,
  startOfDay,
  endOfDay
} from "date-fns"
import { toJalaali } from "jalaali-js"


/**
 * Day name mappings for Persian locale
 */
const DAY_NAMES_FA = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", 
  "پنج‌شنبه", "جمعه", "شنبه"
]

const DAY_NAMES_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", 
  "Thursday", "Friday", "Saturday"
]

/**
 * Slot time representation
 */
export interface TimeSlot {
  /** Formatted time string (e.g., "09:00") */
  time: string
  /** Display label with Persian/English formatting */
  label: string
  /** Whether this slot is available */
  available: boolean
}

/**
 * Date with available slots representation
 */
export interface DateWithSlots {
  /** The date */
  date: Date
  /** Formatted date string (e.g., "1402/12/01" for Persian) */
  formattedDate: string
  /** Day name (e.g., "شنبه") */
  dayName: string
  /** Whether the date is a holiday */
  isHoliday: boolean
  /** Available time slots for this date */
  slots: TimeSlot[]
}

/**
 * Get day name in Persian or English
 * 
 * @param date - The date to get day name for
 * @param locale - Locale code ('fa' or 'en')
 * @returns Day name string
 */
export function getDayName(date: Date, locale: string = "fa"): string {
  const dayIndex = date.getDay()
  return locale === "fa" ? DAY_NAMES_FA[dayIndex] : DAY_NAMES_EN[dayIndex]
}

/**
 * Format date in Persian calendar format
 * Uses Jalali/Shamsi calendar format for Persian locale
 * 
 * The date to format
 * @param @param date - locale - Locale code ('fa' or 'en')
 * @returns Formatted date string
 */
export function formatDatePersian(date: Date, locale: string = "fa"): string {
  if (locale === "fa") {
    // Use Jalali (Persian) calendar format
    const jalaaliDate = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    const toPersian = (num: number) => 
      String(num).split("").map(d => persianDigits[parseInt(d)]).join("")
    
    return `${toPersian(jalaaliDate.jy)}/${toPersian(jalaaliDate.jm)}/${toPersian(jalaaliDate.jd)}`
  }
  
  return format(date, "yyyy-MM-dd")
}

/**
 * Parse time string to Date object
 * 
 * @param timeStr - Time string (e.g., "09:30")
 * @param referenceDate - Reference date to attach time to
 * @returns Date object with the specified time
 */
export function parseTimeToDate(timeStr: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date(referenceDate)
  return setMinutes(setHours(date, hours), minutes)
}

/**
 * Get business hours for a specific day of week
 * 
 * @param organizationId - The organization ID
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @returns Object with startTime, endTime, and isActive, or null if not found
 */
export async function getBusinessHours(
  organizationId: string,
  dayOfWeek: number
): Promise<{ startTime: string; endTime: string; isActive: boolean } | null> {
  const businessHours = await prisma.businessHours.findFirst({
    where: {
      organizationId,
      dayOfWeek,
      isActive: true,
    },
  })
  
  return businessHours
    ? {
        startTime: businessHours.startTime,
        endTime: businessHours.endTime,
        isActive: businessHours.isActive,
      }
    : null
}

/**
 * Check if a date is a holiday for the organization
 * 
 * @param organizationId - The organization ID
 * @param date - The date to check
 * @returns Holiday object if date is holiday, null otherwise
 */
export async function checkHoliday(
  organizationId: string,
  date: Date
): Promise<{ name: string; isRecurring: boolean } | null> {
  const startOfTargetDay = startOfDay(date)
  const endOfTargetDay = endOfDay(date)
  
  // Check for recurring holidays (same month/day each year)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // First check for specific date holiday
  const holiday = await prisma.holiday.findFirst({
    where: {
      organizationId,
      date: {
        gte: startOfTargetDay,
        lte: endOfTargetDay,
      },
    },
  })
  
  if (holiday) {
    return {
      name: holiday.name,
      isRecurring: holiday.isRecurring,
    }
  }
  
  // Check for recurring holiday (same month/day)
  const recurringHoliday = await prisma.holiday.findFirst({
    where: {
      organizationId,
      isRecurring: true,
      date: {
        gte: new Date(date.getFullYear(), month - 1, day),
        lt: new Date(date.getFullYear(), month - 1, day + 1),
      },
    },
  })
  
  if (recurringHoliday) {
    return {
      name: recurringHoliday.name,
      isRecurring: true,
    }
  }
  
  return null
}

/**
 * Get all existing appointments for a specific date
 * 
 * @param organizationId - The organization ID
 * @param date - The date to check
 * @param serviceId - Optional service ID to filter by
 * @param staffId - Optional staff ID to filter by
 * @returns Array of existing appointments
 */
export async function getExistingAppointments(
  organizationId: string,
  date: Date,
  serviceId?: string,
  staffId?: string
): Promise<Array<{ startTime: Date; endTime: Date; status: string }>> {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  
  const whereClause: Record<string, unknown> = {
    service: {
      staff: {
        organizationId,
      },
    },
    startTime: {
      gte: dayStart,
      lte: dayEnd,
    },
    status: {
      notIn: ["CANCELLED"], // Exclude cancelled appointments
    },
  }
  
  if (serviceId) {
    whereClause.serviceId = serviceId
  }
  
  if (staffId) {
    whereClause.service = {
      staffId,
    }
  }
  
  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    select: {
      startTime: true,
      endTime: true,
      status: true,
    },
  })
  
  return appointments
}

/**
 * Generate time slots for a day based on business hours and service duration
 * 
 * @param businessHours - Business hours object with startTime and endTime
 * @param serviceDuration - Duration of the service in minutes
 * @param slotInterval - Interval between slots in minutes
 * @returns Array of time slot strings
 */
export function generateTimeSlots(
  businessHours: { startTime: string; endTime: string },
  serviceDuration: number,
  slotInterval: number = 30
): string[] {
  const slots: string[] = []
  
  const [startHour, startMin] = businessHours.startTime.split(":").map(Number)
  const [endHour, endMin] = businessHours.endTime.split(":").map(Number)
  
  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  while (currentMinutes + serviceDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    )
    currentMinutes += slotInterval
  }
  
  return slots
}

/**
 * Check if a specific slot is available
 * 
 * @param slotStart - The start time of the slot to check
 * @param slotEnd - The end time of the slot
 * @param existingAppointments - Array of existing appointments
 * @returns True if slot is available
 */
export function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  existingAppointments: Array<{ startTime: Date; endTime: Date }>
): boolean {
  // Check against all existing appointments
  for (const appointment of existingAppointments) {
    const apptStart = new Date(appointment.startTime)
    const apptEnd = new Date(appointment.endTime)
    
    // Check for overlap
    const hasOverlap = 
      (isBefore(slotStart, apptEnd) && isAfter(slotEnd, apptStart)) ||
      slotStart.getTime() === apptStart.getTime() ||
      slotEnd.getTime() === apptEnd.getTime()
    
    if (hasOverlap) {
      return false
    }
  }
  
  return true
}

/**
 * Get available slots for a specific date
 * 
 * @param organizationId - The organization ID
 * @param date - The date to get slots for
 * @param serviceId - The service ID for duration
 * @param staffId - Optional staff ID to filter by
 * @param locale - Locale for formatting ('fa' or 'en')
 * @returns Object with date info and available slots
 */
export async function getAvailableSlots(
  organizationId: string,
  date: Date,
  serviceId: string,
  staffId?: string,
  locale: string = "fa"
): Promise<DateWithSlots> {
  const dayOfWeek = date.getDay()
  
  // Get business hours for this day
  const businessHours = await getBusinessHours(organizationId, dayOfWeek)
  
  // Check if it's a holiday
  const holiday = await checkHoliday(organizationId, date)
  
  // Get existing appointments
  const existingAppointments = await getExistingAppointments(
    organizationId,
    date,
    serviceId,
    staffId
  )
  
  // Get service duration
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { duration: true, slotInterval: true },
  })
  
  const serviceDuration = service?.duration || 30
  const slotInterval = service?.slotInterval || 30
  
  // Generate slots
  let slots: TimeSlot[] = []
  
  if (businessHours && businessHours.isActive && !holiday) {
    const timeSlots = generateTimeSlots(businessHours, serviceDuration, slotInterval)
    
    slots = timeSlots.map((time) => {
      const slotStart = parseTimeToDate(time, date)
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)
      
      const available = isSlotAvailable(slotStart, slotEnd, existingAppointments)
      
      return {
        time,
        label: locale === "fa" 
          ? convertToPersianDigits(time)
          : format12HourTime(time),
        available,
      }
    })
  }
  
  return {
    date,
    formattedDate: formatDatePersian(date, locale),
    dayName: getDayName(date, locale),
    isHoliday: !!holiday,
    slots,
  }
}

/**
 * Get available dates with slots for a date range
 * 
 * @param organizationId - The organization ID
 * @param startDate - Start date of range
 * @param days - Number of days to check
 * @param serviceId - The service ID
 * @param staffId - Optional staff ID
 * @param locale - Locale for formatting
 * @returns Array of dates with available slots
 */
export async function getAvailableDates(
  organizationId: string,
  startDate: Date,
  days: number = 14,
  serviceId: string,
  staffId?: string,
  locale: string = "fa"
): Promise<DateWithSlots[]> {
  const dates: DateWithSlots[] = []
  
  for (let i = 0; i < days; i++) {
    const currentDate = addDays(startDate, i)
    const dateWithSlots = await getAvailableSlots(
      organizationId,
      currentDate,
      serviceId,
      staffId,
      locale
    )
    dates.push(dateWithSlots)
  }
  
  return dates
}

/**
 * Convert time string to Persian digits
 * 
 * @param time - Time string (e.g., "09:30")
 * @returns Persian digit time string
 */
function convertToPersianDigits(time: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return time
    .split("")
    .map((char) => {
      const digit = parseInt(char)
      return isNaN(digit) ? char : persianDigits[digit]
    })
    .join("")
}

/**
 * Convert 24-hour time to 12-hour format
 * 
 * @param time - Time string in 24-hour format
 * @returns 12-hour time string (e.g., "9:30 AM")
 */
function format12HourTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function validateBookingRequest(data: {
  organizationId: string
  serviceId: string
  date: Date
  time: string
  staffId?: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.organizationId) {
    errors.push("organizationId is required")
  }
  
  if (!data.serviceId) {
    errors.push("serviceId is required")
  }
  
  if (!data.date || !(data.date instanceof Date) || isNaN(data.date.getTime())) {
    errors.push("valid date is required")
  }
  
  if (!data.time || !/^\d{2}:\d{2}$/.test(data.time)) {
    errors.push("valid time in HH:MM format is required")
  }
  
  // Check if date is in the past
  const today = new Date()
  if (data.date && isBefore(startOfDay(data.date), startOfDay(today))) {
    errors.push("cannot book appointments in the past")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Create a new appointment
 * 
 * @param data - Appointment creation data
 * @returns Created appointment object
 */
export async function createAppointment(data: {
  organizationId: string
  serviceId: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  date: Date
  time: string
  staffId?: string
  notes?: string
}) {
  // Get service for duration
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    select: { duration: true },
  })
  
  if (!service) {
    throw new Error("Service not found")
  }
  
  // Calculate start and end times
  const [hours, minutes] = data.time.split(":").map(Number)
  const startTime = setMinutes(setHours(new Date(data.date), hours), minutes)
  const endTime = new Date(startTime.getTime() + service.duration * 60000)
  
  // Create appointment - no direct organizationId or staffId on Appointment
  const appointment = await prisma.appointment.create({
    data: {
      serviceId: data.serviceId,
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startTime,
      endTime,
      notes: data.notes,
      status: "PENDING",
    },
  })
  
  return appointment
}

/**
 * Get appointment by ID with all relations
 * 
 * @param id - Appointment ID
 * @returns Appointment object with relations
 */
export async function getAppointmentWithDetails(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })
  
  if(appointment?.service){
  const staff = await prisma.staff.findUnique({
    where: { id: appointment.service.staffId},
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      },
      organization: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        }
      }
    }
  })
    const client = appointment.client;
    

    return {appointment, client, staff}
  }
  
  return { appointment: appointment as any, staff: null as any }
}

/**
 * Update appointment status
 * 
 * @param id - Appointment ID
 * @param status - New status
 * @param reason - Optional reason (for cancellation)
 * @returns Updated appointment
 */
export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  reason?: string
) {
  const updateData: Record<string, unknown> = {
    status,
  }
  
  if (status === "CANCELLED" && reason) {
    updateData.cancellationReason = reason
  }
  
  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
  })
  
  return appointment
}
