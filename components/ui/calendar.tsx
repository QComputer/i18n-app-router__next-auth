/**
 * Calendar Component
 *
 * A date picker calendar component that supports:
 * - Single date selection
 * - Persian calendar format (Jalali)
 * - Date highlighting (holidays, selected dates)
 * - Disabled dates
 *
 * Uses date-fns for date manipulation and provides RTL support.
 */

import * as React from "react"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addDays,
  differenceInDays
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDatePersian, getDayName } from "@/lib/appointments/slots"
import { toPersianDigits } from "@/lib/utils"

/**
 * Generate days between two dates
 */
function getDaysArray(start: Date, end: Date): Date[] {
  const days: Date[] = []
  let currentDate = new Date(start)
  while (differenceInDays(end, currentDate) >= 0) {
    days.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  return days
}

/**
 * Calendar component props
 */
interface CalendarProps {
  /** Currently selected date */
  selected?: Date | null
  /** Callback when a date is selected */
  onSelect?: (date: Date) => void
  /** Callback when month changes */
  onMonthChange?: (date: Date) => void
  /** Minimum date (cannot select before this) */
  minDate?: Date
  /** Maximum date (cannot select after this) */
  maxDate?: Date
  /** Array of disabled dates */
  disabledDates?: Date[]
  /** Array of holiday dates with labels */
  holidays?: { date: Date; label: string }[]
  /** Array of dates that have appointments booked */
  bookedDates?: Date[]
  /** Currently displayed month */
  currentMonth?: Date
  /** Locale for formatting ('fa' or 'en') */
  locale?: string
  /** CSS class name */
  className?: string
}

/**
 * Day name abbreviations for Persian locale
 */
const DAY_NAMES_FA = ["Sh", "Ye", "Do", "Se", "Ch", "Pa", "Jo"]
const DAY_NAMES_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

/**
 * Calendar Component
 */
export function Calendar({
  selected,
  onSelect,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates = [],
  holidays = [],
  bookedDates = [],
  currentMonth = new Date(),
  locale = "fa",
  className
}: CalendarProps) {
  // State for currently displayed month
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth)

  // Navigation handlers
  const handlePreviousMonth = () => {
    const newMonth = subMonths(displayMonth, 1)
    setDisplayMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(displayMonth, 1)
    setDisplayMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  // Generate calendar days
  const monthStart = startOfMonth(displayMonth)
  const monthEnd = endOfMonth(displayMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = getDaysArray(calendarStart, calendarEnd)

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) {
      return true
    }

    if (maxDate && isBefore(maxDate, date)) {
      return true
    }

    if (disabledDates.some(d => isSameDay(d, date))) {
      return true
    }

    return false
  }

  // Check if date is a holiday
  const getHoliday = (date: Date) => {
    return holidays.find(h => isSameDay(h.date, date))
  }

  // Check if date has appointments
  const isBooked = (date: Date) => {
    return bookedDates.some(d => isSameDay(d, date))
  }

  // Handle day click
  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date)) return
    onSelect?.(date)
  }

  // Month name formatting
  const getMonthName = (date: Date): string => {
    if (locale === "fa") {
      const months = [
        "Farvardin", "Ordibehesht", "Khordad", "Tir",
        "Mordad", "Shahrivar", "Mehr", "Aban",
        "Azar", "Dey", "Bahman", "Esfand"
      ]
      const persianDate = formatDatePersian(date)
      const parts = persianDate.split("/")
      const monthIndex = parseInt(parts[1]) - 1
      return `${months[monthIndex]} ${parts[0]}`
    }
    return date.toLocaleString("en-US", { month: "long", year: "numeric" })
  }

  const dayNames = locale === "fa" ? DAY_NAMES_FA : DAY_NAMES_EN

  return (
    <div className={cn("p-3", className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <h2 className="font-semibold text-lg">
          {getMonthName(displayMonth)}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-medium py-2",
              "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day: Date, index: number) => {
          const isDisabled = isDateDisabled(day)
          const isCurrentDay = isToday(day)
          const holiday = getHoliday(day)
          const booked = isBooked(day)
          const currentMonthDay = isSameMonth(day, displayMonth)
          const isSelected = selected && isSameDay(day, selected)

          return (
            <div
              key={`${day.toISOString()}-${index}`}
              className={cn(
                "relative",
                !currentMonthDay && "opacity-30"
              )}
            >
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isDisabled}
                className={cn(
                  "w-full h-10 sm:h-12 rounded-md text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCurrentDay && !isSelected && "bg-primary/10 text-primary font-semibold",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                  holiday && !isDisabled && !isSelected && "text-destructive",
                  booked && !isDisabled && !isSelected && "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
                  !isDisabled && !isSelected && "hover:bg-accent"
                )}
              >
                {locale === "fa" ? toPersianDigits(day.getDate()) : day.getDate()}
              </button>

              {/* Holiday badge */}
              {holiday && (
                <Badge
                  variant="outline"
                  className="absolute -top-1 -right-1 h-4 px-1 text-[10px] bg-background"
                >
                  {holiday.label}
                </Badge>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>{locale === "fa" ? "Entekhab Shode" : "Selected"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive/20" />
          <span>{locale === "fa" ? "Tatil" : "Holiday"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary/20" />
          <span>{locale === "fa" ? "Emroz" : "Today"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          </div>
          <span>{locale === "fa" ? "Rezerv Shode" : "Booked"}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Date Range Picker Component
 */
interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onSelectRange?: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
  locale?: string
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onSelectRange,
  minDate,
  maxDate,
  locale = "fa",
  className
}: DateRangePickerProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <Calendar
        currentMonth={startDate || new Date()}
        selected={startDate}
        onSelect={(date) => onSelectRange?.(date, endDate || date)}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
      />
      <div className="hidden sm:block border-l" />
      <Calendar
        currentMonth={endDate || addMonths(startDate || new Date(), 1)}
        selected={endDate}
        onSelect={(date) => onSelectRange?.(startDate || date, date)}
        minDate={startDate || minDate}
        maxDate={maxDate}
        locale={locale}
      />
    </div>
  )
}

export default Calendar
