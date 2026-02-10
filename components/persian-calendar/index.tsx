/**
 * Persian Calendar Component
 *
 * A comprehensive Persian (Jalali) calendar component with:
 * - Monthly, weekly, and daily views
 * - Theme customization (colors, fonts)
 * - Responsive design (compact, full, floating)
 * - Interactive appointment management
 * - Access control based on user hierarchy
 */

"use client"

import * as React from "react"
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react"
import {
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  differenceInDays,
  format,
  setHours,
  setMinutes,
  subDays,
} from "date-fns"
import { toJalaali, toGregorian } from "jalaali-js"
import {
  CalendarView,
  CalendarSize,
  CalendarTheme,
  CalendarFont,
  CalendarThemeConfig,
  CalendarAppointment,
  DateCell,
  WeekRow,
  TimeSlot,
  PERSIAN_DAYS,
  PERSIAN_DAYS_SHORT,
  PERSIAN_MONTHS,
  STATUS_COLORS,
  STATUS_LABELS_FA,
  PersianCalendarProps,
  THEME_PRESETS,
  FONT_FAMILIES,
} from "./types"
import {
  getJalaliDateComponents,
  getPersianDayName,
  getPersianDayNameShort,
  getPersianMonthName,
  getPersianYearMonthString,
  getPersianDateStringShort,
  getPersianDateStringLong,
  getPersianDateStringNumeric,
  getPersianTimeString,
  getPersianDateTimeString,
  getWeekDateRange,
  getMonthDateRange,
  getTimeSlotsForDay,
  isSameJalaliDate,
  isPersianHoliday,
  isPersianWeekend,
  getJalaliWeekNumber,
  getDatesInWeek,
  getDatesInJalaliMonth,
  getPersianYearRange,
  getMonthNavigation,
  getPersianDayOfWeekIndex,
  getPersianYearStart,
  getPersianYearEnd,
} from "./core-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Edit, Trash2, Check, Clock, User, Calendar, MoreHorizontal } from "lucide-react"

/**
 * Default theme configuration
 */
const DEFAULT_THEME: CalendarThemeConfig = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#64748b",
  todayBgColor: "#0ea5e920",
  holidayColor: "#ef4444",
  appointmentBgColor: "#0ea5e9",
  borderColor: "#e2e8f0",
  fontFamily: "default",
  fontSize: 14,
}

/**
 * Persian Calendar Component
 */
export function PersianCalendar({
  initialDate,
  view = "month",
  size = "full",
  theme = "default",
  customTheme,
  font = "default",
  locale = "fa",
  appointments = [],
  holidays = [],
  onDateSelect,
  onAppointmentClick,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
  onViewChange,
  showAppointmentControls = true,
  readOnly = false,
  minDate,
  maxDate,
  className,
  userHierarchy,
  currentStaffId,
}: PersianCalendarProps) {
  // Get effective locale (handle string type safely)
  const effectiveLocale: "fa" | "en" = locale === "en" ? "en" : "fa"

  const [currentView, setCurrentView] = useState<CalendarView>(view)
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [appointmentFormData, setAppointmentFormData] = useState({
    date: "",
    time: "",
    serviceId: "",
    staffId: "",
    notes: "",
  })

  // Theme configuration
  const themeConfig = useMemo(() => {
    if (customTheme) {
      return { ...DEFAULT_THEME, ...customTheme }
    }

    const preset = THEME_PRESETS[theme as Exclude<CalendarTheme, "custom">] || DEFAULT_THEME
    return { ...DEFAULT_THEME, ...preset }
  }, [theme, customTheme])

  // Font configuration
  const fontFamily = FONT_FAMILIES[font] || "inherit"

  // Get calendar data based on current view
  const calendarData = useMemo(() => {
    switch (currentView) {
      case "month":
        const jalali = getJalaliDateComponents(currentDate)
        const monthDates = getDatesInJalaliMonth(jalali.jy, jalali.jm)
        const weeks: { weekNumber: number; days: DateCell[] }[] = []
        let week: DateCell[] = []

        monthDates.forEach((date, index) => {
          const jalaliDate = getJalaliDateComponents(date)
          week.push({
            date,
            jy: jalaliDate.jy,
            jm: jalaliDate.jm,
            jd: jalaliDate.jd,
            dayOfWeek: jalaliDate.dayOfWeek,
            isCurrentMonth: jalaliDate.jm === jalali.jm,
            isToday: isSameDay(date, new Date()),
            isHoliday: isPersianHoliday(date).isHoliday,
            appointments: [],
          })

          if (week.length === 7 || index === monthDates.length - 1) {
            weeks.push({ weekNumber: getJalaliWeekNumber(date), days: week })
            week = []
          }
        })

        return {
          type: "month" as const,
          month: jalali.jm,
          year: jalali.jy,
          monthName: getPersianMonthName(jalali.jm),
          yearMonth: getPersianYearMonthString(currentDate),
          weekRows: weeks,
          currentDate,
        }

      case "week":
        const weekDates = getDatesInWeek(currentDate)
        const jalaliDates = weekDates.map(getJalaliDateComponents)
        const weekNumber = getJalaliWeekNumber(currentDate)

        return {
          type: "week" as const,
          weekNumber,
          dates: weekDates,
          jalaliDates,
          currentDate,
        }

      case "day":
        const jalaliDay = getJalaliDateComponents(currentDate)
        const timeSlots = getTimeSlotsForDay(currentDate)

        return {
          type: "day" as const,
          date: currentDate,
          jalali: jalaliDay,
          timeSlots,
          currentDate,
        }

      default:
        return null
    }
  }, [currentDate, currentView])

  // Get appointments grouped by date for efficient lookup
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, CalendarAppointment[]> = {}

    appointments.forEach(appointment => {
      const dateKey = appointment.startTime.toISOString().split("T")[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })

    return grouped
  }, [appointments])

  // Get holidays grouped by date
  const holidaysByDate = useMemo(() => {
    const grouped: Record<string, { name: string; isRecurring?: boolean }> = {}

    holidays.forEach(holiday => {
      const dateKey = holiday.date.toISOString().split("T")[0]
      grouped[dateKey] = { name: holiday.name, isRecurring: holiday.isRecurring }
    })

    return grouped
  }, [holidays])

  // Get filtered appointments based on user hierarchy
  const filteredAppointments = useMemo(() => {
    if (!userHierarchy) return appointments

    switch (userHierarchy) {
      case "MERCHANT":
        // Only show appointments for current staff
        return appointments.filter(appt => appt.staffId === currentStaffId)

      case "MANAGER":
      case "OWNER":
        // Show all appointments for organization
        return appointments

      default:
        // For regular users, show only their own appointments
        return appointments.filter(appt => appt.clientId === currentStaffId)
    }
  }, [appointments, userHierarchy, currentStaffId])

  // Handle view change
  const handleViewChange = useCallback((newView: CalendarView) => {
    setCurrentView(newView)
    onViewChange?.(newView)
  }, [onViewChange])

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }, [onDateSelect])

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment)
    onAppointmentClick?.(appointment)
  }, [onAppointmentClick])

  // Handle appointment creation
  const handleCreateAppointment = useCallback((date: Date, time?: string) => {
    if (readOnly) return

    setAppointmentFormData(prev => ({
      ...prev,
      date: date.toISOString().split("T")[0],
      time: time || "",
    }))
    setIsCreatingAppointment(true)
    onAppointmentCreate?.(date, time)
  }, [readOnly, onAppointmentCreate])

  // Handle appointment update
  const handleUpdateAppointment = useCallback((appointment: CalendarAppointment) => {
    if (readOnly) return

    setSelectedAppointment(appointment)
    onAppointmentUpdate?.(appointment)
  }, [readOnly, onAppointmentUpdate])

  // Handle appointment deletion
  const handleDeleteAppointment = useCallback((appointmentId: string) => {
    if (readOnly) return

    onAppointmentDelete?.(appointmentId)
  }, [readOnly, onAppointmentDelete])

  // Handle navigation
  const handlePrevious = useCallback(() => {
    switch (currentView) {
      case "month":
        setCurrentDate(prev => subMonths(prev, 1))
        break
      case "week":
        setCurrentDate(prev => subDays(prev, 7))
        break
      case "day":
        setCurrentDate(prev => subDays(prev, 1))
        break
    }
  }, [currentView])

  const handleNext = useCallback(() => {
    switch (currentView) {
      case "month":
        setCurrentDate(prev => addMonths(prev, 1))
        break
      case "week":
        setCurrentDate(prev => addDays(prev, 7))
        break
      case "day":
        setCurrentDate(prev => addDays(prev, 1))
        break
    }
  }, [currentView])

  // Handle today button
  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback((date: Date) => {
    const dateKey = date.toISOString().split("T")[0]
    return appointmentsByDate[dateKey] || []
  }, [appointmentsByDate])

  // Get holiday info for a specific date
  const getHolidayInfo = useCallback((date: Date) => {
    const dateKey = date.toISOString().split("T")[0]
    return holidaysByDate[dateKey]
  }, [holidaysByDate])

  // Check if a date is disabled
  const isDateDisabled = useCallback((date: Date) => {
    if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) {
      return true
    }

    if (maxDate && isAfter(date, maxDate)) {
      return true
    }

    return false
  }, [minDate, maxDate])

  // Get appointment status color
  const getStatusColor = useCallback((status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING
  }, [])

  // Render month view
  const renderMonthView = useCallback(() => {
    if (!calendarData || calendarData.type !== "month") return null

    const { weekRows, monthName, yearMonth } = calendarData

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {monthName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {yearMonth}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-sm"
          >
            امروز
          </Button>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {PERSIAN_DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 bg-card rounded-lg border border-border/50 p-1">
          {weekRows.map((weekRow, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {weekRow.days.map((day, dayIndex) => {
                const isToday = isSameDay(day.date, new Date())
                const isSelected = selectedDate && isSameDay(day.date, selectedDate)
                const isDisabled = isDateDisabled(day.date)
                const holidayInfo = getHolidayInfo(day.date)
                const dayAppointments = getAppointmentsForDate(day.date)
                const hasAppointments = dayAppointments.length > 0

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "relative",
                      !day.isCurrentMonth && "opacity-30",
                      day.isHoliday && "text-destructive"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleDateSelect(day.date)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full h-12 sm:h-14 rounded-lg text-sm font-medium transition-all flex items-center justify-center relative group",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isToday && !isSelected && "bg-primary/10",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                        isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                        !isDisabled && !isSelected && "hover:bg-accent",
                        hasAppointments && "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:rounded-full after:bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10",
                          isToday && !isSelected && "font-semibold",
                          day.isHoliday && !isDisabled && "font-medium text-destructive"
                        )}
                      >
                        {effectiveLocale === "fa" ? day.jd.toString().replace(/[0-9]/g, (digit) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]) : day.jd}
                      </span>

                      {/* Holiday badge */}
                      {holidayInfo && (
                        <Badge
                          variant="outline"
                          className="absolute -top-1 -right-1 h-4 px-1 text-[10px] bg-background"
                        >
                          {holidayInfo.name}
                        </Badge>
                      )}
                    </button>

                    {/* Appointment indicators */}
                    {hasAppointments && (
                      <div className="absolute inset-0 pointer-events-none">
                        {dayAppointments.map((appointment, index) => {
                          const statusColor = getStatusColor(appointment.status)
                          const isLast = index === dayAppointments.length - 1

                          return (
                            <div
                              key={appointment.id}
                              className={cn(
                                "absolute left-1 right-1 bottom-0 h-1 rounded-full transition-all duration-200",
                                isLast && "w-2"
                              )}
                              style={{ backgroundColor: statusColor.bg }}
                              title={appointment.service.name}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAppointmentClick(appointment)
                              }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/20" />
            <span>مرخصی</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400/20" />
            <span>کار</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400/20" />
            <span>جلسه</span>
          </div>
        </div>
      </div>
    )
  }, [calendarData, selectedDate, effectiveLocale, themeConfig])

  // Render week view
  const renderWeekView = useCallback(() => {
    if (!calendarData || calendarData.type !== "week") return null

    const { dates, jalaliDates, weekNumber } = calendarData

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h3 className="font-semibold text-lg">
                هفته {weekNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {jalaliDates[0].jy} {PERSIAN_MONTHS[jalaliDates[0].jm - 1]} - {PERSIAN_MONTHS[jalaliDates[6].jm - 1]}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-sm"
          >
            امروز
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 bg-card rounded-lg border border-border/50 p-2">
          {dates.map((date, index) => {
            const jalali = jalaliDates[index]
            const isToday = isSameDay(date, new Date())
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isDisabled = isDateDisabled(date)
            const holidayInfo = getHolidayInfo(date)
            const dayAppointments = getAppointmentsForDate(date)
            const hasAppointments = dayAppointments.length > 0

            return (
              <div
                key={index}
                className={cn(
                  "relative flex-1",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full h-20 rounded-lg text-center transition-all flex flex-col items-center justify-center relative group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isToday && !isSelected && "bg-primary/10",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                    !isDisabled && !isSelected && "hover:bg-accent",
                  )}
                >
                  <div className="font-medium">
                    {effectiveLocale === "fa" ? jalali.jd.toString().replace(/[0-9]/g, (digit) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]) : jalali.jd}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getPersianDayNameShort(jalali.dayOfWeek)}
                  </div>

                  {/* Holiday badge */}
                  {holidayInfo && (
                    <Badge
                      variant="outline"
                      className="absolute -top-1 -right-1 h-4 px-1 text-[10px] bg-background"
                    >
                      {holidayInfo.name}
                    </Badge>
                  )}
                </button>

                {/* Appointment indicators */}
                {hasAppointments && (
                  <div className="absolute inset-0 pointer-events-none">
                    {dayAppointments.map((appointment, index) => {
                      const statusColor = getStatusColor(appointment.status)
                      const isLast = index === dayAppointments.length - 1

                      return (
                        <div
                          key={appointment.id}
                          className={cn(
                            "absolute left-1 right-1 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-200",
                            isLast && "w-2"
                          )}
                          style={{ backgroundColor: statusColor.bg }}
                          title={appointment.service.name}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAppointmentClick(appointment)
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Appointments list for the week */}
        {showAppointmentControls && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              جلسات این هفته
            </h4>
            <div className="space-y-2">
              {filteredAppointments
                .filter(appt => {
                  const apptDate = new Date(appt.startTime)
                  return dates.some(date => isSameDay(date, apptDate))
                })
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(appointment.status).bg,
                          border: `2px solid ${getStatusColor(appointment.status).border}`
                        }}
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.service.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPersianDateTimeString(new Date(appointment.startTime), effectiveLocale)}
                        </p>
                      </div>
                    </div>

                    {appointment.staff && appointment.staff.user && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{appointment.staff.user.name || appointment.staff.user.username}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }, [calendarData, selectedDate, effectiveLocale, themeConfig])

  // Render day view
  const renderDayView = useCallback(() => {
    if (!calendarData || calendarData.type !== "day") return null

    const { date, jalali, timeSlots } = calendarData
    const appointments = getAppointmentsForDate(date)

    // Group appointments by time slot
    const appointmentsByTime = appointments.reduce((acc, appointment) => {
      const startTime = new Date(appointment.startTime)
      const timeKey = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, "0")}`
      if (!acc[timeKey]) {
        acc[timeKey] = []
      }
      acc[timeKey].push(appointment)
      return acc
    }, {} as Record<string, CalendarAppointment[]>)

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {getPersianDateStringLong(date, effectiveLocale)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getPersianTimeString(date, effectiveLocale)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-sm"
          >
            امروز
          </Button>
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          {timeSlots.map((timeSlot) => {
            const hasAppointments = appointmentsByTime[timeSlot.time]?.length > 0
            const isHovered = hoveredTimeSlot === timeSlot.time

            return (
              <div
                key={timeSlot.time}
                className={cn(
                  "relative flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer",
                  hasAppointments && "cursor-pointer",
                  isHovered && "bg-accent/50"
                )}
                onMouseEnter={() => setHoveredTimeSlot(timeSlot.time)}
                onMouseLeave={() => setHoveredTimeSlot(null)}
                onClick={() => {
                  if (!readOnly) {
                    handleCreateAppointment(date, timeSlot.time)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium">
                      {timeSlot.timePersian}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasAppointments ? "جلسات فعال" : "آزاد"}
                    </p>
                  </div>
                </div>

                {hasAppointments && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{appointmentsByTime[timeSlot.time]?.length} جلسه</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Appointments for the day */}
        {showAppointmentControls && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              جلسات امروز
            </h4>
            <div className="space-y-2">
              {filteredAppointments
                .filter(appt => isSameDay(new Date(appt.startTime), date))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(appointment.status).bg,
                          border: `2px solid ${getStatusColor(appointment.status).border}`
                        }}
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.service.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPersianDateTimeString(new Date(appointment.startTime), effectiveLocale)}
                        </p>
                      </div>
                    </div>

                    {appointment.staff && appointment.staff.user && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{appointment.staff.user.name || appointment.staff.user.username}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }, [calendarData, selectedDate, hoveredTimeSlot, effectiveLocale, themeConfig])

  // Render view based on current view mode
  const renderView = useCallback(() => {
    switch (currentView) {
      case "month":
        return renderMonthView()
      case "week":
        return renderWeekView()
      case "day":
        return renderDayView()
      default:
        return renderMonthView()
    }
  }, [currentView, renderMonthView, renderWeekView, renderDayView])

  // Get view buttons
  const viewButtons = (
    <div className="flex gap-2">
      <Button
        variant={currentView === "month" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("month")}
        className="text-sm"
      >
        ماه
      </Button>
      <Button
        variant={currentView === "week" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("week")}
        className="text-sm"
      >
        هفته
      </Button>
      <Button
        variant={currentView === "day" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("day")}
        className="text-sm"
      >
        روز
      </Button>
    </div>
  )

  // Get theme and font styles
  const calendarStyles = {
    fontFamily: fontFamily,
    fontSize: `${themeConfig.fontSize}px`,
  }

  return (
    <div
      className={cn(
        "relative",
        className,
        size === "compact" && "max-w-md",
        size === "full" && "max-w-6xl",
        size === "floating" && "absolute top-0 left-0 right-0 bottom-0",
      )}
      style={calendarStyles}
    >
      {/* View selector */}
      {size !== "compact" && (
        <div className="mb-4 flex justify-center">
          {viewButtons}
        </div>
      )}

      {/* Calendar content */}
      <div className="bg-card rounded-lg border border-border/50 shadow-sm">
        {renderView()}
      </div>

      {/* Floating controls for compact size */}
      {size === "compact" && (
        <div className="fixed bottom-4 left-4 right-4 flex gap-2">
          {viewButtons}
        </div>
      )}
    </div>
  )
}

export default PersianCalendar
