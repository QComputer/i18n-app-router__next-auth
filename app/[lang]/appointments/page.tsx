/**
 * Appointment List Page
 * 
 * Displays a list of appointments with filtering and status management.
 * Supports viewing, canceling, and managing appointments.
 * 
 * Route: /[lang]/appointments
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDatePersian, getDayName } from "@/lib/appointments/slots"
import { toPersianDigits } from "@/lib/utils"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Status translation mapping
 * Uses hardcoded translations to avoid type issues with dictionary
 */
function getStatusLabel(status: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    fa: {
      PENDING: "در انتظار",
      CONFIRMED: "تأیید شده",
      COMPLETED: "تکمیل شده",
      CANCELLED: "لغو شده",
    },
    en: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    },
    ar: {
      PENDING: "قيد الانتظار",
      CONFIRMED: "مؤكد",
      COMPLETED: "مكتمل",
      CANCELLED: "ملغي",
    },
    tr: {
      PENDING: "Bekliyor",
      CONFIRMED: "Onaylandı",
      COMPLETED: "Tamamlandı",
      CANCELLED: "İptal Edildi",
    },
  }
  return labels[locale]?.[status] || status
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
      return "warning"
    case "CONFIRMED":
      return "success"
    case "COMPLETED":
      return "secondary"
    case "CANCELLED":
      return "destructive"
    default:
      return "default"
  }
}

/**
 * Appointment list page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function AppointmentsPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  
  // Get current session
  const session = await auth()
  
  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  
  // Get user's organization ID (or first organization for now)
  const organizationId = session.user.organizationId || null
  
  // Fetch appointments
  const whereClause: Record<string, unknown> = {}
  
  if (organizationId) {
    whereClause.organizationId = organizationId
  } else {
    // If user has no organization, show only their appointments
    whereClause.clientId = session.user.id
  }
  
  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      service: true,
      staff: true,
      client: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
    take: 50, // Limit to 50 appointments
  })
  
  // Translation helpers - using type-safe accessors
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.appointment?.title || "Appointments",
    listDescription: dict.appointment?.listDescription || "Manage your appointments",
    newAppointment: dict.appointment?.newAppointment || "New Appointment",
    statusPlaceholder: "Status",
    appointmentDate: dict.appointment?.appointmentDate || "Date",
    appointmentTime: dict.appointment?.appointmentTime || "Time",
    service: dict.appointment?.service || "Service",
    client: dict.appointment?.client || "Client",
    notes: dict.appointment?.notes || "Notes",
    cancel: dict.appointment?.cancel || "Cancel",
    noAppointments: dict.appointment?.noAppointments || "No appointments found",
    noAppointmentsDescription: dict.appointment?.noAppointmentsDescription || "You don't have any appointments yet. Create your first appointment to get started.",
    search: dict.common?.search || "Search",
    all: dict.common?.all || "All",
    reset: dict.common?.reset || "Reset",
    view: dict.common?.view || "View",
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.listDescription}</p>
        </div>
        
        {/* New Appointment Button */}
        <Link href={`/${locale}/appointments/new`}>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            {t.newAppointment}
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.search}
                className="pl-9"
              />
            </div>
            
            {/* Status Filter */}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t.statusPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="PENDING">{getStatusLabel("PENDING", locale)}</SelectItem>
                <SelectItem value="CONFIRMED">{getStatusLabel("CONFIRMED", locale)}</SelectItem>
                <SelectItem value="COMPLETED">{getStatusLabel("COMPLETED", locale)}</SelectItem>
                <SelectItem value="CANCELLED">{getStatusLabel("CANCELLED", locale)}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date Filter */}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t.appointmentDate} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all} {t.appointmentDate}</SelectItem>
                <SelectItem value="today">{locale === "fa" ? "امروز" : "Today"}</SelectItem>
                <SelectItem value="week">{locale === "fa" ? "این هفته" : "This Week"}</SelectItem>
                <SelectItem value="month">{locale === "fa" ? "این ماه" : "This Month"}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Reset Filters Button */}
            <Button variant="outline">
              <Filter className="ml-2 h-4 w-4" />
              {t.reset}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.noAppointments}</h3>
            <p className="text-muted-foreground text-center mb-4">{t.noAppointmentsDescription}</p>
            <Link href={`/${locale}/appointments/new`}>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t.newAppointment}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Appointment Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.appointmentDate}</p>
                        <p className="font-medium">
                          {locale === "fa" 
                            ? `${getDayName(appointment.startTime, "fa")} ${formatDatePersian(appointment.startTime)}`
                            : format(appointment.startTime, "EEEE, MMMM d, yyyy")
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.appointmentTime}</p>
                        <p className="font-medium">
                          {locale === "fa"
                            ? `${toPersianDigits(format(appointment.startTime, "HH:mm"))} - ${toPersianDigits(format(appointment.endTime, "HH:mm"))}`
                            : `${format(appointment.startTime, "h:mm a")} - ${format(appointment.endTime, "h:mm a")}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Service */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.service}</p>
                        <p className="font-medium">{appointment.service.name}</p>
                      </div>
                    </div>
                    
                    {/* Client Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.client}</p>
                        <p className="font-medium">{appointment.clientName}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          {appointment.clientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {locale === "fa" ? toPersianDigits(appointment.clientPhone) : appointment.clientPhone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {appointment.clientEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Status Badge */}
                    <Badge variant={getStatusVariant(appointment.status)}>
                      {getStatusLabel(appointment.status, locale)}
                    </Badge>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/${locale}/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">{t.view}</Button>
                      </Link>
                      
                      {appointment.status === "PENDING" && (
                        <Link href={`/${locale}/appointments/${appointment.id}/cancel`}>
                          <Button variant="outline" size="sm" className="text-destructive">{t.cancel}</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Notes (if any) */}
                {appointment.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{t.notes}:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {appointments.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">{locale === "fa" ? toPersianDigits("1") : "1"}</Button>
          <Button variant="outline">{locale === "fa" ? toPersianDigits("2") : "2"}</Button>
          <Button variant="outline">{locale === "fa" ? toPersianDigits("3") : "3"}</Button>
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
