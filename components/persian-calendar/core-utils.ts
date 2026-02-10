/**
 * Persian Calendar Core Utilities
 *
 * Core utilities for Jalali (Persian) calendar calculations and conversions.
 * Includes date conversion, holiday calculations, and calendar logic.
 */

import { toJalaali, toGregorian } from "jalaali-js"
import { addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, isBefore, isAfter, differenceInDays, format } from "date-fns"

/**
 * Convert Gregorian date to Jalali (Persian) date
 */
export function gregorianToJalali(date: Date): { jy: number; jm: number; jd: number } {
  const gregorian = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
  return toJalaali(gregorian.year, gregorian.month, gregorian.day)
}

/**
 * Convert Jalali (Persian) date to Gregorian date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const gregorian = toGregorian(jy, jm, jd)
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
}

/**
 * Get Jalali date components from Gregorian date
 */
export function getJalaliDateComponents(date: Date): { jy: number; jm: number; jd: number; dayOfWeek: number } {
  const jalali = gregorianToJalali(date)
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  return { ...jalali, dayOfWeek }
}

/**
 * Get Persian month name
 */
export function getPersianMonthName(month: number): string {
  const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ]
  return months[month - 1] || ""
}

/**
 * Get Persian day name (starting from Saturday)
 */
export function getPersianDayName(dayOfWeek: number): string {
  const days = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
  ]
  return days[dayOfWeek] || ""
}

/**
 * Get Persian day name abbreviated
 */
export function getPersianDayNameShort(dayOfWeek: number): string {
  const days = [
    "ش",
    "ی",
    "د",
    "س",
    "چ",
    "پ",
    "ج",
  ]
  return days[dayOfWeek] || ""
}

/**
 * Check if a date is a Persian holiday
 */
export function isPersianHoliday(date: Date): { isHoliday: boolean; name?: string } {
  const jalali = getJalaliDateComponents(date)
  
  // Fixed holidays (same Jalali date every year)
  const fixedHolidays = [
    { jm: 1, jd: 1, name: "نوروز" },    // Farvardin 1
    { jm: 1, jd: 2, name: "نوروز" },    // Farvardin 2
    { jm: 1, jd: 3, name: "نوروز" },    // Farvardin 3
    { jm: 1, jd: 4, name: "نوروز" },    // Farvardin 4
    { jm: 12, jd: 29, name: "روز طبیعت" }, // Esfand 29
    { jm: 11, jd: 22, name: "پیروزی انقلاب" }, // Bahman 22
    { jm: 3, jd: 12, name: "رحلت امام خمینی" }, // Khordad 12
    { jm: 3, jd: 14, name: "قیام ۱۵ خرداد" }, // Khordad 14
  ]

  // Islamic holidays (based on lunar calendar, approximate)
  const islamicHolidays = [
    { jm: 3, jd: 1, name: "مبعث" }, // Khordad 1 (approximate)
    { jm: 3, jd: 27, name: "مبعث" }, // Khordad 27 (approximate)
    { jm: 6, jd: 24, name: "مبعث" }, // Shahrivar 24 (approximate)
  ]

  // Check fixed holidays
  for (const holiday of fixedHolidays) {
    if (jalali.jm === holiday.jm && jalali.jd === holiday.jd) {
      return { isHoliday: true, name: holiday.name }
    }
  }

  // Check Islamic holidays (approximate)
  for (const holiday of islamicHolidays) {
    if (jalali.jm === holiday.jm && jalali.jd === holiday.jd) {
      return { isHoliday: true, name: holiday.name }
    }
  }

  return { isHoliday: false }
}

/**
 * Get days in a Jalali month
 */
export function getDaysInJalaliMonth(jy: number, jm: number): number {
  // Check if it's a leap year in Jalali calendar
  const isLeap = isJalaliLeapYear(jy)
  
  // Esfand has 29 days in regular years, 30 in leap years
  if (jm === 12) {
    return isLeap ? 30 : 29
  }
  
  // First 6 months have 31 days, next 5 have 30 days
  return jm <= 6 ? 31 : 30
}

/**
 * Check if a Jalali year is a leap year
 */
export function isJalaliLeapYear(jy: number): boolean {
  // Jalali leap year calculation
  // A Jalali year is leap if ( ( (jy + 38) * 2346 ) % 2820 ) < 2346
  const calculation = ((jy + 38) * 2346) % 2820
  return calculation < 2346
}

/**
 * Get week number for a Jalali date
 */
export function getJalaliWeekNumber(date: Date): number {
  const startOfYear = jalaliToGregorian(getJalaliDateComponents(date).jy, 1, 1)
  const daysOffset = differenceInDays(date, startOfYear)
  return Math.floor(daysOffset / 7) + 1
}

/**
 * Get all dates in a Jalali month
 */
export function getDatesInJalaliMonth(jy: number, jm: number): Date[] {
  const daysInMonth = getDaysInJalaliMonth(jy, jm)
  const dates: Date[] = []
  
  for (let jd = 1; jd <= daysInMonth; jd++) {
    dates.push(jalaliToGregorian(jy, jm, jd))
  }
  
  return dates
}

/**
 * Get week rows for a Jalali month (for month view)
 */
export function getWeekRowsForJalaliMonth(jy: number, jm: number): {
  weekNumber: number
  days: {
    date: Date
    jy: number
    jm: number
    jd: number
    dayOfWeek: number
    isCurrentMonth: boolean
    isToday: boolean
    isHoliday: boolean
    holidayName?: string
  }[]
}[] {
  const dates = getDatesInJalaliMonth(jy, jm)
  const weekRows: any[] = []
  
  // Get the first day of the month and find which day of week it is
  const firstDate = dates[0]
  const firstDayOfWeek = firstDate.getDay() // 0 = Sunday, 6 = Saturday
  
  // In Persian calendar, week starts on Saturday (day 6 in Gregorian)
  // We need to align the week properly
  const startOfWeekDate = subDays(firstDate, (firstDayOfWeek + 1) % 7)
  
  let currentDate = startOfWeekDate
  let currentWeekNumber = getJalaliWeekNumber(firstDate)
  
  while (true) {
    const weekRow: any = {
      weekNumber: currentWeekNumber,
      days: []
    }
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const jalali = getJalaliDateComponents(currentDate)
      const isCurrentMonth = jalali.jm === jm
      const isToday = isSameDay(currentDate, new Date())
      const holidayInfo = isPersianHoliday(currentDate)
      
      weekRow.days.push({
        date: currentDate,
        jy: jalali.jy,
        jm: jalali.jm,
        jd: jalali.jd,
        dayOfWeek: jalali.dayOfWeek,
        isCurrentMonth,
        isToday,
        isHoliday: holidayInfo.isHoliday,
        holidayName: holidayInfo.name,
      })
      
      currentDate = addDays(currentDate, 1)
    }
    
    weekRows.push(weekRow)
    
    // Check if we've covered the entire month
    const lastDate = weekRow.days[6].date
    const lastJalali = getJalaliDateComponents(lastDate)
    if (lastJalali.jm > jm || (lastJalali.jm === jm && lastJalali.jd > getDaysInJalaliMonth(jy, jm))) {
      break
    }
    
    currentWeekNumber++
  }
  
  return weekRows
}

/**
 * Get time slots for a day (for week/day views)
 */
export function getTimeSlotsForDay(
  date: Date,
  startTime: string = "08:00",
  endTime: string = "20:00",
  intervalMinutes: number = 30
): {
  time: string
  timePersian: string
  hour: number
  minute: number
  appointments: any[]
}[] {
  const slots: any[] = []
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  
  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    
    // Convert to Persian digits
    const timePersian = time.replace(/[0-9]/g, (digit) => {
      const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
      return persianDigits[parseInt(digit)]
    })
    
    slots.push({
      time,
      timePersian,
      hour: hours,
      minute: minutes,
      appointments: [],
    })
    
    currentMinutes += intervalMinutes
  }
  
  return slots
}

/**
 * Get date range for week view
 */
export function getWeekDateRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  const start = subDays(date, (dayOfWeek + 1) % 7) // Start from Saturday
  const end = addDays(start, 6) // End on Friday
  return { start, end }
}

/**
 * Get date range for month view
 */
export function getMonthDateRange(date: Date): { start: Date; end: Date } {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return { start, end }
}

/**
 * Check if two Jalali dates are the same
 */
export function isSameJalaliDate(date1: Date, date2: Date): boolean {
  const jalali1 = getJalaliDateComponents(date1)
  const jalali2 = getJalaliDateComponents(date2)
  return jalali1.jy === jalali2.jy && jalali1.jm === jalali2.jm && jalali1.jd === jalali2.jd
}

/**
 * Format Jalali date as string
 */
export function formatJalaliDate(date: Date, locale: "fa" | "en" = "fa"): string {
  const jalali = getJalaliDateComponents(date)
  
  if (locale === "fa") {
    return `${jalali.jy}/${jalali.jm.toString().padStart(2, "0")}/${jalali.jd.toString().padStart(2, "0")}`
  }
  
  return `${jalali.jy}/${jalali.jm.toString().padStart(2, "0")}/${jalali.jd.toString().padStart(2, "0")}`
}

/**
 * Get Persian year range for a given date
 */
export function getPersianYearRange(date: Date): { startYear: number; endYear: number } {
  const jalali = getJalaliDateComponents(date)
  return { startYear: jalali.jy, endYear: jalali.jy }
}

/**
 * Get previous and next month for navigation
 */
export function getMonthNavigation(date: Date): {
  previous: { jy: number; jm: number }
  current: { jy: number; jm: number }
  next: { jy: number; jm: number }
} {
  const jalali = getJalaliDateComponents(date)
  
  const previous = { jy: jalali.jy, jm: jalali.jm - 1 }
  const current = { jy: jalali.jy, jm: jalali.jm }
  const next = { jy: jalali.jy, jm: jalali.jm + 1 }
  
  // Handle year boundaries
  if (previous.jm === 0) {
    previous.jy = jalali.jy - 1
    previous.jm = 12
  }
  
  if (next.jm === 13) {
    next.jy = jalali.jy + 1
    next.jm = 1
  }
  
  return { previous, current, next }
}

/**
 * Get all dates in a week (for week view)
 */
export function getDatesInWeek(date: Date): Date[] {
  const { start } = getWeekDateRange(date)
  const dates: Date[] = []
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i))
  }
  
  return dates
}

/**
 * Get the first day of the week for a given date (Saturday)
 */
export function getFirstDayOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  return subDays(date, (dayOfWeek + 1) % 7) // Go back to Saturday
}

/**
 * Get the last day of the week for a given date (Friday)
 */
export function getLastDayOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  return addDays(date, 6 - ((dayOfWeek + 1) % 7)) // Go forward to Friday
}

/**
 * Get the number of weeks in a Jalali month
 */
export function getWeeksInJalaliMonth(jy: number, jm: number): number {
  const dates = getDatesInJalaliMonth(jy, jm)
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]
  
  const firstDayOfWeek = getFirstDayOfWeek(firstDate)
  const lastDayOfWeek = getLastDayOfWeek(lastDate)
  
  return Math.ceil(differenceInDays(lastDayOfWeek, firstDayOfWeek) / 7) + 1
}

/**
 * Get the day of week index for Persian calendar (Saturday = 0)
 */
export function getPersianDayOfWeekIndex(date: Date): number {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  return (dayOfWeek + 1) % 7 // Convert to Saturday = 0
}

/**
 * Get the day of week index for Gregorian calendar (Sunday = 0)
 */
export function getGregorianDayOfWeekIndex(date: Date): number {
  return date.getDay() // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a weekend in Persian calendar (Friday = weekend)
 */
export function isPersianWeekend(date: Date): boolean {
  const jalali = getJalaliDateComponents(date)
  return jalali.dayOfWeek === 6 // Friday
}

/**
 * Check if a date is a weekend in Gregorian calendar (Saturday & Sunday)
 */
export function isGregorianWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

/**
 * Get the first day of the Persian year for a given date
 */
export function getPersianYearStart(date: Date): Date {
  const jalali = getJalaliDateComponents(date)
  return jalaliToGregorian(jalali.jy, 1, 1)
}

/**
 * Get the last day of the Persian year for a given date
 */
export function getPersianYearEnd(date: Date): Date {
  const jalali = getJalaliDateComponents(date)
  return jalaliToGregorian(jalali.jy, 12, getDaysInJalaliMonth(jalali.jy, 12))
}

/**
 * Get the Persian year and month as a formatted string
 */
export function getPersianYearMonthString(date: Date, locale: "fa" | "en" = "fa"): string {
  const jalali = getJalaliDateComponents(date)
  const monthName = getPersianMonthName(jalali.jm)
  
  if (locale === "fa") {
    return `${jalali.jy} ${monthName}`
  }
  
  return `${jalali.jy} ${monthName}`
}

/**
 * Get the Persian date as a formatted string (short format)
 */
export function getPersianDateStringShort(date: Date, locale: "fa" | "en" = "fa"): string {
  const jalali = getJalaliDateComponents(date)
  const dayName = getPersianDayName(jalali.dayOfWeek)
  const monthName = getPersianMonthName(jalali.jm)
  
  if (locale === "fa") {
    return `${dayName}، ${jalali.jd} ${monthName}`
  }
  
  return `${dayName}, ${jalali.jd} ${monthName}`
}

/**
 * Get the Persian date as a formatted string (long format)
 */
export function getPersianDateStringLong(date: Date, locale: "fa" | "en" = "fa"): string {
  const jalali = getJalaliDateComponents(date)
  const dayName = getPersianDayName(jalali.dayOfWeek)
  const monthName = getPersianMonthName(jalali.jm)
  
  if (locale === "fa") {
    return `${dayName}، ${jalali.jd} ${monthName} ${jalali.jy}`
  }
  
  return `${dayName}, ${jalali.jd} ${monthName} ${jalali.jy}`
}

/**
 * Get the Persian date as a formatted string (numeric format)
 */
export function getPersianDateStringNumeric(date: Date, locale: "fa" | "en" = "fa"): string {
  const jalali = getJalaliDateComponents(date)
  
  if (locale === "fa") {
    return `${jalali.jy}/${jalali.jm.toString().padStart(2, "0")}/${jalali.jd.toString().padStart(2, "0")}`
  }
  
  return `${jalali.jy}/${jalali.jm.toString().padStart(2, "0")}/${jalali.jd.toString().padStart(2, "0")}`
}

/**
 * Get the Persian time as a formatted string
 */
export function getPersianTimeString(date: Date, locale: "fa" | "en" = "fa"): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  if (locale === "fa") {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    const formatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    return formatted.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Get the Persian date and time as a formatted string
 */
export function getPersianDateTimeString(date: Date, locale: "fa" | "en" | string = "fa"): string {
  const effectiveLocale = locale === "en" ? "en" : "fa"
  const dateString = getPersianDateStringLong(date, effectiveLocale)
  const timeString = getPersianTimeString(date, effectiveLocale)
  
  if (effectiveLocale === "fa") {
    return `${dateString}، ساعت ${timeString}`
  }
  
  return `${dateString} at ${timeString}`
}
