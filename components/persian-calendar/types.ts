/**
 * Persian Calendar Types
 *
 * Type definitions for the Persian (Jalali/Shamsi) calendar component.
 * Supports multiple views, themes, and appointment management features.
 */

/**
 * Calendar view modes
 */
export type CalendarView = "month" | "week" | "day"

/**
 * Calendar size variants
 */
export type CalendarSize = "compact" | "full" | "floating"

/**
 * Predefined color themes for the calendar
 */
export type CalendarTheme = 
  | "default"     // Blue primary
  | "emerald"     // Green primary
  | "violet"      // Purple primary
  | "rose"        // Pink primary
  | "amber"       // Yellow/Orange primary
  | "slate"       // Gray primary
  | "custom"      // User-defined colors

/**
 * Font family options for the calendar
 */
export type CalendarFont = 
  | "default"     // System font
  | "vazirmatn"   // Vazirmatn Persian font
  | "shabnam"     // Shabnam Persian font
  | "sahel"       // Sahel Persian font

/**
 * Calendar theme configuration
 */
export interface CalendarThemeConfig {
  /** Primary color for selected dates and highlights */
  primaryColor: string
  /** Secondary color for accents */
  secondaryColor: string
  /** Background color for today */
  todayBgColor: string
  /** Text color for holidays */
  holidayColor: string
  /** Background color for appointment indicators */
  appointmentBgColor: string
  /** Border color for calendar cells */
  borderColor: string
  /** Font family */
  fontFamily: CalendarFont
  /** Base font size in pixels */
  fontSize: number
}

/**
 * Predefined theme presets
 */
export const THEME_PRESETS: Record<Exclude<CalendarTheme, "custom">, Partial<CalendarThemeConfig>> = {
  default: {
    primaryColor: "#0ea5e9",
    secondaryColor: "#64748b",
    todayBgColor: "#0ea5e920",
    holidayColor: "#ef4444",
    appointmentBgColor: "#0ea5e9",
    borderColor: "#e2e8f0",
  },
  emerald: {
    primaryColor: "#10b981",
    secondaryColor: "#6b7280",
    todayBgColor: "#10b98120",
    holidayColor: "#ef4444",
    appointmentBgColor: "#10b981",
    borderColor: "#d1d5db",
  },
  violet: {
    primaryColor: "#8b5cf6",
    secondaryColor: "#6b7280",
    todayBgColor: "#8b5cf620",
    holidayColor: "#ef4444",
    appointmentBgColor: "#8b5cf6",
    borderColor: "#e5e7eb",
  },
  rose: {
    primaryColor: "#f43f5e",
    secondaryColor: "#6b7280",
    todayBgColor: "#f43f5e20",
    holidayColor: "#ef4444",
    appointmentBgColor: "#f43f5e",
    borderColor: "#fecdd3",
  },
  amber: {
    primaryColor: "#f59e0b",
    secondaryColor: "#6b7280",
    todayBgColor: "#f59e0b20",
    holidayColor: "#ef4444",
    appointmentBgColor: "#f59e0b",
    borderColor: "#fde68a",
  },
  slate: {
    primaryColor: "#64748b",
    secondaryColor: "#475569",
    todayBgColor: "#64748b20",
    holidayColor: "#ef4444",
    appointmentBgColor: "#64748b",
    borderColor: "#cbd5e1",
  },
}

/**
 * Font family CSS values
 */
export const FONT_FAMILIES: Record<CalendarFont, string> = {
  default: "inherit",
  vazirmatn: "'Vazirmatn', sans-serif",
  shabnam: "'Shabnam', sans-serif",
  sahel: "'Sahel', sans-serif",
}

/**
 * Service information for appointments
 */
export interface CalendarService {
  id: string
  name: string
  duration: number
  color: string | null
}

/**
 * Staff user information
 */
export interface CalendarStaffUser {
  name: string | null
  username: string
}

/**
 * Staff information for appointments
 */
export interface CalendarStaff {
  id: string
  bio: string | null
  user: CalendarStaffUser | null
}

/**
 * Appointment with additional display properties
 * Local type definition to avoid Prisma client dependency
 */
export interface CalendarAppointment {
  /** Unique identifier */
  id: string
  /** Appointment start time */
  startTime: Date
  /** Appointment end time */
  endTime: Date
  /** Appointment status */
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  /** Optional notes */
  notes: string | null
  /** Client name */
  clientName: string
  /** Client email */
  clientEmail: string | null
  /** Client phone */
  clientPhone: string | null
  /** Cancellation reason (if cancelled) */
  cancellationReason: string | null
  /** Organization ID */
  organizationId: string
  /** Service ID */
  serviceId: string
  /** Client ID */
  clientId: string | null
  /** Staff ID */
  staffId: string | null
  /** Creation timestamp */
  createdAt: Date
  /** Update timestamp */
  updatedAt: Date
  /** Related service information */
  service: CalendarService
  /** Related staff information (if assigned) */
  staff: CalendarStaff | null
}

/**
 * Date cell information for rendering
 */
export interface DateCell {
  /** Gregorian date */
  date: Date
  /** Jalali year */
  jy: number
  /** Jalali month (1-12) */
  jm: number
  /** Jalali day (1-31) */
  jd: number
  /** Day of week (0 = Saturday in Persian calendar, 0 = Sunday in Gregorian) */
  dayOfWeek: number
  /** Whether this date is in the current displayed month */
  isCurrentMonth: boolean
  /** Whether this date is today */
  isToday: boolean
  /** Whether this date is a holiday */
  isHoliday: boolean
  /** Holiday name if applicable */
  holidayName?: string
  /** Appointments on this date */
  appointments: CalendarAppointment[]
}

/**
 * Week row for month view
 */
export interface WeekRow {
  /** Days in this week */
  days: DateCell[]
  /** Week number in the year */
  weekNumber: number
}

/**
 * Time slot for day/week views
 */
export interface TimeSlot {
  /** Hour (0-23) */
  hour: number
  /** Minute (0 or 30) */
  minute: number
  /** Formatted time string (e.g., "09:00") */
  time: string
  /** Persian formatted time (e.g., "۰۹:۰۰") */
  timePersian: string
  /** Appointments in this slot */
  appointments: CalendarAppointment[]
}

/**
 * Persian month names
 */
export const PERSIAN_MONTHS = [
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

/**
 * Persian month names in English transliteration
 */
export const PERSIAN_MONTHS_EN = [
  "Farvardin",
  "Ordibehesht",
  "Khordad",
  "Tir",
  "Mordad",
  "Shahrivar",
  "Mehr",
  "Aban",
  "Azar",
  "Dey",
  "Bahman",
  "Esfand",
]

/**
 * Persian day names (starting from Saturday)
 */
export const PERSIAN_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
]

/**
 * Persian day names abbreviated
 */
export const PERSIAN_DAYS_SHORT = [
  "ش",
  "ی",
  "د",
  "س",
  "چ",
  "پ",
  "ج",
]

/**
 * English day names (starting from Saturday for Persian calendar alignment)
 */
export const ENGLISH_DAYS_FOR_PERSIAN = [
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
]

/**
 * Appointment status colors
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#f59e0b",
  },
  CONFIRMED: {
    bg: "#dbeafe",
    text: "#1e40af",
    border: "#3b82f6",
  },
  COMPLETED: {
    bg: "#d1fae5",
    text: "#065f46",
    border: "#10b981",
  },
  CANCELLED: {
    bg: "#fee2e2",
    text: "#991b1b",
    border: "#ef4444",
  },
}

/**
 * Persian appointment status labels
 */
export const STATUS_LABELS_FA: Record<string, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تایید شده",
  COMPLETED: "انجام شده",
  CANCELLED: "لغو شده",
}

/**
 * Locale type for calendar
 */
export type CalendarLocale = "fa" | "en" | string

/**
 * Calendar component props
 */
export interface PersianCalendarProps {
  /** Initial date to display */
  initialDate?: Date
  /** Calendar view mode */
  view?: CalendarView
  /** Calendar size */
  size?: CalendarSize
  /** Color theme */
  theme?: CalendarTheme
  /** Custom theme configuration (when theme is "custom") */
  customTheme?: Partial<CalendarThemeConfig>
  /** Font family */
  font?: CalendarFont
  /** Locale for labels ("fa" or "en") */
  locale?: CalendarLocale
  /** Appointments to display */
  appointments?: CalendarAppointment[]
  /** Holidays to mark */
  holidays?: { date: Date; name: string; isRecurring?: boolean }[]
  /** Callback when date is selected */
  onDateSelect?: (date: Date) => void
  /** Callback when appointment is clicked */
  onAppointmentClick?: (appointment: CalendarAppointment) => void
  /** Callback when appointment is created */
  onAppointmentCreate?: (date: Date, time?: string) => void
  /** Callback when appointment is updated */
  onAppointmentUpdate?: (appointment: CalendarAppointment) => void
  /** Callback when appointment is deleted */
  onAppointmentDelete?: (appointmentId: string) => void
  /** Callback when view changes */
  onViewChange?: (view: CalendarView) => void
  /** Whether to show appointment management controls */
  showAppointmentControls?: boolean
  /** Whether the calendar is in read-only mode */
  readOnly?: boolean
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Additional CSS class */
  className?: string
  /** User hierarchy for access control */
  userHierarchy?: "OWNER" | "MANAGER" | "MERCHANT"
  /** Current staff ID (for MERCHANT role filtering) */
  currentStaffId?: string
}
