import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind CSS class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Format currency in Persian format
export function formatCurrency(
  amount: number,
  currency: string = "IRR",
  locale: string = "fa"
): string {
  // For Iranian Rial, display in Tomans (1 Toman = 10,000 Rials)
  const displayAmount = currency === "IRR" ? amount / 10000 : amount
  const currencyCode = currency === "IRR" ? "IRT" : currency

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(displayAmount)
}

// Convert English digits to Persian
export function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

// Convert Persian digits to English
export function toEnglishDigits(num: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹"
  return num.replace(/[۰-۹]/g, (digit) =>
    String(persianDigits.indexOf(digit))
  )
}

// Format phone number for display
export function formatPhone(phone: string, locale: string = "fa"): string {
  // Iranian phone number formatting
  if (phone.startsWith("09")) {
    const formatted = phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3")
    return locale === "fa" ? toPersianDigits(formatted) : formatted
  }
  return phone
}

// Format duration from minutes to human readable
export function formatDuration(minutes: number, locale: string = "fa"): string {
  if (minutes < 60) {
    const text = locale === "fa" ? `${minutes} دقیقه` : `${minutes} min`
    return locale === "fa" ? toPersianDigits(text) : text
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    const text = locale === "fa" ? `${hours} ساعت` : `${hours} hr`
    return locale === "fa" ? toPersianDigits(text) : text
  }

  const text =
    locale === "fa"
      ? `${hours} ساعت و ${remainingMinutes} دقیقه`
      : `${hours} hr ${remainingMinutes} min`
  return locale === "fa" ? toPersianDigits(text) : text
}

// Generate time slots for a day
export function generateTimeSlots(
  startTime: string, // "09:00"
  endTime: string, // "17:00"
  interval: number // minutes
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    )
    currentMinutes += interval
  }

  return slots
}

// Check if time is within business hours
export function isWithinBusinessHours(
  time: string,
  startTime: string,
  endTime: string
): boolean {
  const [hours, minutes] = time.split(":").map(Number)
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  const currentMinutes = hours * 60 + minutes
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

// Calculate end time from start time and duration
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
}

// Get day name in Persian
export function getDayNamePersian(dayIndex: number): string {
  const days = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ]
  return days[dayIndex]
}

// Get day name in English
export function getDayNameEnglish(dayIndex: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  return days[dayIndex]
}
