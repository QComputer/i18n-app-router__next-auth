/**
 * Organization Settings Page
 * 
 * Navigation hub for organization settings.
 * 
 * Route: /[lang]/settings/organization
 */

import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { ArrowRight, Users, Folder, Globe, Clock, Settings, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { requireOrganizationAdmin } from "@/lib/auth/admin"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Organization settings page component
 * 
 * @param props.params - Promise resolving to { lang: string }
 */
export default async function OrganizationSettingsPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale

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
    title: dict.organization?.title || "Organization Settings",
    subtitle: dict.organization?.subtitle || "Manage your organization information",
    // Navigation card labels
    general: "General",
    generalDesc: "Basic information and details",
    staff: "Staff Management",
    staffDesc: "Manage team members",
    categories: "Service Categories",
    categoriesDesc: "Organize services into categories",
    publicPage: "Public Page",
    publicPageDesc: "Customize landing page",
    businessHours: "Business Hours",
    businessHoursDesc: "Set operating hours",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/settings`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {dict.common?.back || "Back"}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Settings */}
        <Link href={`/${locale}/settings/organization/general`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">{t.general}</p>
                <p className="text-sm text-muted-foreground">{t.generalDesc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-auto" />
            </CardContent>
          </Card>
        </Link>
        
        {/* Staff Management */}
        <Link href={`/${locale}/settings/organization/staff`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t.staff}</p>
                <p className="text-sm text-muted-foreground">{t.staffDesc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-auto" />
            </CardContent>
          </Card>
        </Link>
        
        {/* Service Categories */}
        <Link href={`/${locale}/settings/organization/categories`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Folder className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">{t.categories}</p>
                <p className="text-sm text-muted-foreground">{t.categoriesDesc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-auto" />
            </CardContent>
          </Card>
        </Link>
        
        {/* Public Page */}
        <Link href={`/${locale}/settings/organization/public-page`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{t.publicPage}</p>
                <p className="text-sm text-muted-foreground">{t.publicPageDesc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-auto" />
            </CardContent>
          </Card>
        </Link>
        
        {/* Business Hours */}
        <Link href={`/${locale}/settings/organization`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold">{t.businessHours}</p>
                <p className="text-sm text-muted-foreground">{t.businessHoursDesc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
