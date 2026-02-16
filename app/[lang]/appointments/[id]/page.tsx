/**
 * Appointment Detail Page
 * 
 * Displays detailed information about a single appointment.
 * Provides options to cancel or reschedule appointments.
 * 
 * Route: /[lang]/appointments/[id]
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
  MapPin,
  ArrowRight,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  getAppointmentWithDetails, 
  updateAppointmentStatus,
  formatDatePersian, 
  getDayName 
} from "@/lib/appointments/slots"
import { toPersianDigits } from "@/lib/utils"
import { isOrganizationAdmin } from "@/lib/auth/admin"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Status badge variant mapping
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
 * Status label translation
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
  }
  return labels[locale]?.[status] || status
}

/**
 * Info row component for displaying appointment details
 */
function InfoRow({ 
  icon: Icon, 
  label, 
  value,
  locale = "fa"
}: { 
  icon: React.ElementType
  label: string
  value: string | React.ReactNode
  locale?: string
}) {
  return (
    <div className="flex items-start gap-4 py-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium mt-1">{value}</div>
      </div>
    </div>
  )
}

/**
 * Appointment detail page component
 */
export default async function AppointmentDetailPage(props: {
  params: Promise<{ lang: string; id: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  const appointmentId = params.id

  // Get current session
  const session = await auth()
  
  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  
  // Fetch appointment details
  const {appointment, client, staff} = await getAppointmentWithDetails(appointmentId)

  // If appointment not found, redirect to appointments list
  if (!appointment) {
    redirect(`/${locale}/appointments`)
  }
  
  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.appointment?.title || "Appointments",
    appointmentDetails: dict.appointment?.appointmentDetails || "Appointment Details",
    appointmentDate: dict.appointment?.appointmentDate || "Date",
    appointmentTime: dict.appointment?.appointmentTime || "Time",
    duration: dict.appointment?.duration || "Duration",
    service: dict.appointment?.service || "Service",
    staff: dict.appointment?.staff || "Staff",
    notes: dict.appointment?.notes || "Notes",
    statusLabel: "Status",
    clientInfo: dict.appointment?.clientInfo || "Client Information",
    organizationInfo: dict.appointment?.organizationInfo || "Organization Information",
    staffInfo: dict.appointment?.staffInfo || "Staff Information",
    clientName: dict.appointment?.fullName || "Full Name",
    staffName: dict.appointment?.fullName || "Full Name",
    phoneNumber: dict.appointment?.phoneNumber || "Phone",
    email: dict.appointment?.email || "Email",
    cancelAppointment: dict.appointment?.cancelAppointment || "Cancel Appointment",
    cancel: dict.appointment?.cancel || "Cancel",
    confirm: dict.common?.confirm || "Confirm",
    back: dict.common?.back || "Back",
    edit: dict.common?.edit || "Edit",
    createdAt: dict.appointment?.createdAt || "Created",
    updatedAt: dict.appointment?.updatedAt || "Updated",
    noNotes: locale === "fa" ? "Without notes" : "No notes",
  }
  
  // Format date and time
  const formattedDate = locale === "fa"
    ? `${getDayName(appointment.startTime, "fa")} ${formatDatePersian(appointment.startTime)}`
    : format(appointment.startTime, "EEEE, MMMM d, yyyy")
  
  const formattedTime = locale === "fa"
    ? `${toPersianDigits(format(appointment.startTime, "HH:mm"))} - ${toPersianDigits(format(appointment.endTime, "HH:mm"))}`
    : `${format(appointment.startTime, "h:mm a")} - ${format(appointment.endTime, "h:mm a")}`
  
  const formattedCreatedAt = locale === "fa"
    ? formatDatePersian(appointment.createdAt)
    : format(appointment.createdAt, "PPP p")
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link 
        href={`/${locale}/appointments`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back} {t.title}
      </Link>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.appointmentDetails}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={getStatusVariant(appointment.status)}>
              {getStatusLabel(appointment.status, locale)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{appointment.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {appointment.status === "PENDING" && (
            <form action={async () => {
              "use server"
              await updateAppointmentStatus(appointmentId, "CANCELLED")
              redirect(`/${locale}/appointments/${appointmentId}`)
            }}>
              <Button variant="destructive" type="submit">
                <XCircle className="ml-2 h-4 w-4" />
                {t.cancelAppointment}
              </Button>
            </form>
          )}
          
          {appointment.status === "PENDING" && (
            <Link href={`/${locale}/appointments/${appointmentId}/edit`}>
              <Button variant="outline">
                <Edit className="ml-2 h-4 w-4" />
                {t.edit}
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointment Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.appointmentDetails}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {/* Date */}
              <InfoRow
                icon={Calendar}
                label={t.appointmentDate}
                value={formattedDate}
              />
              
              {/* Time */}
              <InfoRow
                icon={Clock}
                label={t.appointmentTime}
                value={formattedTime}
              />
              
              {/* Service */}
              <InfoRow
                icon={CheckCircle}
                label={t.service}
                value={
                  <div>
                    <div>{appointment.service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {toPersianDigits(appointment.service.duration)} دقیقه
                    </div>
                  </div>
                }
              />
              
              {/* Staff (if assigned) */}
              {staff && (
                <InfoRow
                  icon={User}
                  label={t.staff}
                  value={staff?.user.name}
                />
              )}
              
              {/* Notes */}
              <InfoRow
                icon={AlertCircle}
                label={t.notes}
                value={appointment.notes || t.noNotes}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                {t.clientInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t.clientName}</p>
                  <p className="font-medium">{appointment.clientName}</p>
                </div>
                
                {appointment.clientPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.phoneNumber}</p>
                    <p className="font-medium">
                      {locale === "fa" 
                        ? toPersianDigits(appointment.clientPhone)
                        : appointment.clientPhone
                      }
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  <p className="font-medium">{appointment.clientEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Organization Card (if available) */}
          {staff.organization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                {t.organizationInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "fa" ? "نام سازمان" : "Organization"}
                    </p>
                    <p className="font-medium">{staff.organization.name}</p>
                  </div>
                  
                  {staff.organization.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.phoneNumber}</p>
                      <p className="font-medium">
                        {locale === "fa" 
                          ? toPersianDigits(staff.organization.phone)
                          : staff.organization.phone
                        }
                      </p>
                    </div>
                  )}
                  
                  {staff.organization.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {locale === "fa" ? "آدرس" : "Address"}
                      </p>
                      <p className="font-medium">{staff.organization.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staff Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                {t.staffInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t.staffName}</p>
                  <p className="font-medium">{staff?.user.name}</p>
                </div>

                {staff?.user.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.phoneNumber}</p>
                    <p className="font-medium">
                      {locale === "fa"
                        ? toPersianDigits(staff?.user.phone)
                        : staff?.user.phone
                      }
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  <p className="font-medium">{staff?.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === "fa" ? "اطلاعات سیستمی" : "System Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.createdAt}</span>
                  <span>{formattedCreatedAt}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{appointment.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
