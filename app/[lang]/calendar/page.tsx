/**
 * Calendar Page Component
 *
 * Main calendar page that displays the Persian calendar with appointments.
 * Integrates with the existing dashboard and provides appointment management.
 */

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import { PersianCalendar } from "@/components/persian-calendar"
import { 
  CalendarAppointment, 
  CalendarView, 
  CalendarSize,
  CalendarTheme,
  CalendarFont,
  THEME_PRESETS,
  FONT_FAMILIES
} from "@/components/persian-calendar/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

/**
 * Type definitions for the calendar page dictionary
 */
type CalendarPageDict = {
  calendar: {
    title: string
    month: string
    week: string
    day: string
    today: string
    previous: string
    next: string
    noAppointments: string
    newAppointment: string
    upcomingAppointments: string
    pastAppointments: string
    allAppointments: string
    status: {
      pending: string
      confirmed: string
      completed: string
      cancelled: string
    }
    actions: {
      create: string
      edit: string
      delete: string
      view: string
    }
  }
}

/**
 * Get appointments for the calendar based on user role
 */
async function getCalendarAppointments(
  organizationId: string, 
  hierarchy?: string | null, 
  staffId?: string | null
): Promise<CalendarAppointment[]> {
  // Build where clause based on user role - filter via service -> staff relation
  const whereCondition = {
    service: {
      staff: {
        organizationId,
      },
    },
    status: {
      not: "CANCELLED" as const,
    },
  }

  // Filter by staff for MERCHANT role
  let serviceFilter: Record<string, unknown> | undefined
  if (hierarchy === "MERCHANT" && staffId) {
    serviceFilter = {
      staff: {
        id: staffId,
      },
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      ...whereCondition,
      ...(serviceFilter ? { service: serviceFilter } : {}),
    },
    orderBy: { startTime: "asc" },
    include: {
      service: {
        include: {
          staff: {
            include: {
              user: {
                select: {
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // Transform to CalendarAppointment format
  return appointments.map((apt): CalendarAppointment => ({
    id: apt.id,
    startTime: apt.startTime,
    endTime: apt.endTime,
    status: apt.status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    notes: apt.notes,
    clientName: apt.clientName,
    clientEmail: apt.clientEmail,
    clientPhone: apt.clientPhone,
    cancellationReason: apt.cancellationReason,
    organizationId: organizationId,
    serviceId: apt.serviceId,
    clientId: apt.clientId,
    staffId: apt.service.staffId || null,
    createdAt: apt.createdAt,
    updatedAt: apt.updatedAt,
    service: {
      id: apt.service.id,
      name: apt.service.name,
      duration: apt.service.duration,
      color: apt.service.color,
    },
    staff: apt.service.staff ? {
      id: apt.service.staff.id,
      bio: apt.service.staff.bio,
      user: apt.service.staff.user,
    } : null,
  }))
}

/**
 * Get holidays for the organization
 */
async function getHolidays(organizationId: string) {
  const now = new Date()
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  const holidays = await prisma.holiday.findMany({
    where: {
      organizationId,
      date: {
        gte: now,
        lte: nextYear,
      },
    },
    orderBy: { date: "asc" },
  })

  return holidays.map(h => ({
    date: new Date(h.date),
    name: h.name,
    isRecurring: h.isRecurring,
  }))
}

/**
 * Status Badge Component
 */
function StatusBadge({ status, label }: { status: string; label: string }) {
  const statusConfig: Record<string, { color: string; icon: typeof AlertCircle }> = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    CONFIRMED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    COMPLETED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <Badge className={cn("flex items-center gap-1", config.color)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

/**
 * Main Calendar Page Component
 */
export default async function CalendarPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  // Get session and user info
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/${lang}/auth/signin`)
  }

  const user = session.user
  const organizationId = user.organizationId

  if (!organizationId) {
    redirect(`/${lang}/dashboard`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as CalendarPageDict

  // Fetch data based on user role
  const [appointments, holidays] = await Promise.all([
    getCalendarAppointments(
      organizationId,
      user.hierarchy,
      user.staffId
    ),
    getHolidays(organizationId),
  ])

  // Get user role and hierarchy
  const userRole = user.role
  const userHierarchy = user.hierarchy as "OWNER" | "MANAGER" | "MERCHANT" | undefined

  // Status labels
  const statusLabels: Record<string, string> = {
    PENDING: dict.calendar?.status?.pending || "در انتظار",
    CONFIRMED: dict.calendar?.status?.confirmed || "تایید شده",
    COMPLETED: dict.calendar?.status?.completed || "انجام شده",
    CANCELLED: dict.calendar?.status?.cancelled || "لغو شده",
  }

  // Get upcoming appointments (next 5)
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.startTime) >= new Date())
    .slice(0, 5)

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dict.calendar?.title || "تقویم"}</h1>
          <p className="text-muted-foreground">
            {userHierarchy === "MERCHANT" 
              ? "نمایش جلسات شما"
              : "نمایش تمام جلسات سازمان"}
          </p>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 ml-2" />
            {dict.calendar?.month || "ماهانه"}
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 ml-2" />
            {dict.calendar?.week || "هفتگی"}
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 ml-2" />
            {dict.calendar?.day || "روزانه"}
          </Button>
        </div>
      </div>

      {/* Calendar and Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar Area */}
        <div className="lg:col-span-3">
          <PersianCalendar
            initialDate={new Date()}
            view="month"
            size="full"
            theme="default"
            locale={lang === "fa" ? "fa" : "en"}
            appointments={appointments}
            holidays={holidays}
            userHierarchy={userHierarchy}
            currentStaffId={user.staffId || undefined}
            showAppointmentControls={true}
          />
        </div>

        {/* Sidebar - Upcoming Appointments */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {dict.calendar?.upcomingAppointments || "جلسات آینده"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{appointment.service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.startTime).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                        <StatusBadge 
                          status={appointment.status} 
                          label={statusLabels[appointment.status] || appointment.status} 
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(appointment.startTime).toLocaleTimeString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {appointment.staff && appointment.staff.user && (
                          <>
                            <User className="h-3 w-3 ml-2" />
                            <span>{appointment.staff.user.name || appointment.staff.user.username}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {dict.calendar?.noAppointments || "جلسه‌ای یافت نشد"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">آمار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{appointments.length}</p>
                  <p className="text-xs text-muted-foreground">کل جلسات</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                  <p className="text-xs text-muted-foreground">جلسات آینده</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
