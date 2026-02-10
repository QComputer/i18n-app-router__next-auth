/**
 * Service List Page
 * 
 * Displays a list of services for the organization.
 * Supports viewing, creating, editing, and deleting services.
 * 
 * Route: /[lang]/services
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { Plus, Clock, DollarSign, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toPersianDigits } from "@/lib/utils"
import { getServicesByOrganization } from "@/lib/services/service"

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
 * Service list page component
 * 
 * @param props.params - Promise resolving to { lang: string }
 */
export default async function ServicesPage(props: {
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

  // Get user's organization ID
    const staffId = session.user.staffId || null
    const organizationId = session.user.organizationId || null

  // Redirect to dashboard if no organization
  if (!organizationId && !staffId) {
    redirect(`/${locale}/dashboard`)
  }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.service?.title || "Services",
    listDescription: dict.service?.listDescription || "Manage your services",
    newService: dict.service?.newService || "Add New Service",
    name: dict.service?.name || "Name",
    description: dict.service?.description || "Description",
    duration: dict.service?.duration || "Duration",
    price: dict.service?.price || "Price",
    status: dict.service?.status || "Status",
    active: dict.service?.active || "Active",
    inactive: dict.service?.inactive || "Inactive",
    edit: dict.common?.edit || "Edit",
    delete: dict.common?.delete || "Delete",
    search: dict.common?.search || "Search",
    noServices: dict.service?.noServices || "No services found",
    noServicesDescription: dict.service?.noServicesDescription || "You don't have any services yet. Create your first service to get started.",
    minutes: locale === "fa" ? "دقیقه" : "minutes",
    rial: locale === "fa" ? "ریال" : "IRR",
  }

  // Fetch services from database
  const services = await getServicesByOrganization(organizationId)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.listDescription}</p>
        </div>

        {/* New Service Button */}
        <Link href={`/${locale}/services/new`}>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            {t.newService}
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.search}
          className="pl-9"
        />
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.noServices}</h3>
            <p className="text-muted-foreground text-center mb-4">{t.noServicesDescription}</p>
            <Link href={`/${locale}/services/new`}>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t.newService}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant={getStatusVariant(service.isActive)}>
                    {service.isActive ? t.active : t.inactive}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {locale === "fa" ? toPersianDigits(service.duration) : service.duration} {t.minutes}
                    </span>
                  </div>
                  {service.price !== null && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {locale === "fa" ? toPersianDigits(service.price.toString()) : service.price} {t.rial}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/${locale}/services/${service.id}`}>
                    <Button variant="outline" size="sm">
                      {t.edit}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
