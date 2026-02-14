/**
 * Service Detail Page
 * 
 * Displays detailed information about a single service.
 * Provides options to edit or delete the service based on user permissions.
 * Includes a paginated appointments list for authorized users.
 * 
 * Route: /[lang]/services/[id]
 */

import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { deleteServiceAction } from "@/app/actions/services"
import { ArrowRight, Edit, Trash2, Clock, DollarSign, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toPersianDigits } from "@/lib/utils"
import { getServiceByIdWithRelations, getAppointmentsByService } from "@/lib/services/service"
import { ServiceAppointmentsList } from "@/components/service-appointments-list"
import prisma from "@/lib/db/prisma"
import { isAdmin, requireOrganizationAdmin } from "@/lib/auth/admin"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Status badge variant mapping
 */
function getStatusVariant(isActive: boolean): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  return isActive ? "success" : "secondary"
}

/**
 * Status label translation
 */
function getStatusLabel(isActive: boolean, locale: string): string {
  return isActive
    ? locale === "fa" ? "فعال" : "Active"
    : locale === "fa" ? "غیرفعال" : "Inactive"
}

/**
 * Check if user can manage (edit/delete) this service
 */
async function canManageService(
  serviceId: string,
  sessionStaffId: string | null,
  sessionOrganizationId: string | null,
  userRole: string
): Promise<boolean> {
  if (!sessionStaffId || !sessionOrganizationId) {
    return false
  }

  // ADMIN can manage all services
  if (isAdmin(userRole)) return true

  // Get service with staff info
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      staff: {
        select: { organizationId: true },
      },
    },
  })

  if (!service) return false

  // Get user's staff hierarchy
  const staff = await prisma.staff.findUnique({
    where: { id: sessionStaffId },
    select: { hierarchy: true },
  })

  // Check if user is the service owner
  const isOwner = service.staffId === sessionStaffId
  // Check if user is OWNER of the organization
  const isOrgOwner = staff?.hierarchy === "OWNER" && service.staff.organizationId === sessionOrganizationId

  return isOwner || isOrgOwner
}

/**
 * Service detail page component
 * 
 * @param props.params - Promise resolving to { lang: Locale, id: string }
 */
export default async function ServiceDetailPage(props: {
  params: Promise<{ lang: string; id: string }>
}) {
    const params = await props.params
    const locale = params.lang as Locale
    const serviceId = params.id

    // Get current user
    // Check user role - only OWNER/MANAGER or ADMIN can access organization settings
    const user = await requireOrganizationAdmin()
    const organizationId = user.organizationId
    if (!user || !organizationId) {
      redirect(`/${locale}/settings`)
    }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.service?.title || "Services",
    serviceDetails: dict.service?.serviceDetails || "Service Details",
    name: dict.service?.name || "Name",
    description: dict.service?.description || "Description",
    duration: dict.service?.duration || "Duration",
    price: dict.service?.price || "Price",
    status: dict.service?.status || "Status",
    category: dict.service?.category || "Category",
    staff: dict.service?.staff || "Staff",
    active: dict.service?.active || "Active",
    inactive: dict.service?.inactive || "Inactive",
    edit: dict.common?.edit || "Edit",
    delete: dict.common?.delete || "Delete",
    back: dict.common?.back || "Back",
    createdAt: dict.common?.createdAt || "Created",
    updatedAt: dict.common?.updatedAt || "Updated",
    noDescription: locale === "fa" ? "بدون توضیحات" : "No description",
    minutes: locale === "fa" ? "دقیقه" : "minutes",
    rial: locale === "fa" ? "ریال" : "IRR",
    providedBy: dict.service?.providedBy || "Provided by:",
    // Appointments translations
    appointmentsTitle: locale === 'fa' ? 'نوبت‌های این خدمات' : 'Service Appointments',
    noAppointments: locale === 'fa' ? 'هیچ نوبتی یافت نشد' : 'No appointments found',
    noAppointmentsDesc: locale === 'fa' ? 'این خدمات هنوز رزرو نشده است' : 'This service has not been booked yet',
    client: locale === 'fa' ? 'مشتری' : 'Client',
    date: locale === 'fa' ? 'تاریخ' : 'Date',
    time: locale === 'fa' ? 'زمان' : 'Time',
    viewDetails: locale === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    previous: locale === 'fa' ? 'قبلی' : 'Previous',
    next: locale === 'fa' ? 'بعدی' : 'Next',
    page: locale === 'fa' ? 'صفحه' : 'Page',
    of: locale === 'fa' ? 'از' : 'of',
  }

  // Fetch service from database with relations
  const service = await getServiceByIdWithRelations(serviceId)

  // If service not found, redirect to services list
  if (!service) {
    redirect(`/${locale}/services`)
  }

  // Check if user can manage this service
  const canManage = await canManageService(
    serviceId,
    user.staffId ?? null,
    user.organizationId ?? null,
    user.role ?? user.hierarchy ?? null
  )

  // Fetch appointments for this service (only for authorized users)
  let appointmentsData = null
  if (canManage) {
    appointmentsData = await getAppointmentsByService(serviceId, { page: 1, limit: 10 })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/services`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back} {t.title}
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.serviceDetails}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={getStatusVariant(service.isActive)}>
              {getStatusLabel(service.isActive, locale)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{service.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons - Only for authorized users */}
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/${locale}/services/${serviceId}/edit`}>
              <Button variant="outline">
                <Edit className="ml-2 h-4 w-4" />
                {t.edit}
              </Button>
            </Link>
            <form action={async () => {
              "use server"
              await deleteServiceAction(serviceId, locale)
            }}>
              <Button type="submit" variant="destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                {t.delete}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t.description}</h3>
                <p className="text-base">
                  {service.description || t.noDescription}
                </p>
              </div>

              <Separator />

              {/* Category */}
              {service.serviceCategory && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.category}</p>
                    <p className="font-medium">{service.serviceCategory.name}</p>
                  </div>
                </div>
              )}

              {/* Staff */}
              {service.staff && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.staff}</p>
                    <p className="font-medium">{service.staff.user.name || service.staff.user.email}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Duration and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.duration}</p>
                    <p className="font-medium">
                      {locale === "fa" ? toPersianDigits(service.duration.toString()) : service.duration} {t.minutes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.price}</p>
                    <p className="font-medium">
                      {service.price !== null
                        ? `${locale === "fa" ? toPersianDigits(service.price.toString()) : service.price} ${t.rial}`
                        : "-"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Slot Interval */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === "fa" ? "بازه زمانی" : "Slot Interval"}
                  </p>
                  <p className="font-medium">
                    {locale === "fa" ? toPersianDigits(service.slotInterval.toString()) : service.slotInterval} {t.minutes}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <span>
                    {locale === "fa"
                      ? toPersianDigits(service.createdAt.toLocaleDateString("fa-IR"))
                      : service.createdAt.toLocaleDateString()
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.updatedAt}</span>
                  <span>
                    {locale === "fa"
                      ? toPersianDigits(service.updatedAt.toLocaleDateString("fa-IR"))
                      : service.updatedAt.toLocaleDateString()
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{service.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointments List - Only show for authorized users */}
      {canManage && appointmentsData && (
        <ServiceAppointmentsList
          serviceId={serviceId}
          initialAppointments={appointmentsData.appointments.map(a => ({
            ...a,
            startTime: new Date(a.startTime),
            endTime: new Date(a.endTime),
          }))}
          initialTotal={appointmentsData.total}
          initialPage={appointmentsData.page}
          initialTotalPages={appointmentsData.totalPages}
          locale={locale}
          translations={{
            title: t.appointmentsTitle,
            noAppointments: t.noAppointments,
            noAppointmentsDesc: t.noAppointmentsDesc,
            client: t.client,
            date: t.date,
            time: t.time,
            staff: t.staff,
            status: t.status,
            viewDetails: t.viewDetails,
            previous: t.previous,
            next: t.next,
            page: t.page,
            of: t.of,
            pending: locale === 'fa' ? 'در انتظار' : 'Pending',
            confirmed: locale === 'fa' ? 'تایید شده' : 'Confirmed',
            cancelled: locale === 'fa' ? 'لغو شده' : 'Cancelled',
            completed: locale === 'fa' ? 'تکمیل شده' : 'Completed',
          }}
        />
      )}
    </div>
  )
}
