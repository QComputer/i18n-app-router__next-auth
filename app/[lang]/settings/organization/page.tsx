/**
 * Organization Settings Page
 * 
 * Form for editing organization settings.
 * 
 * Route: /[lang]/settings/organization
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { ArrowRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrganizationById } from "@/lib/organization/organization"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Organization settings page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function OrganizationSettingsPage(props: {
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

  // Get user's organization ID
  const organizationId = session.user.organizationId || null

  // Redirect to dashboard if no organization
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Check user role - only OWNER and ADMIN can access organization settings
  const userRole = session.user.role
  if (!['OWNER', 'ADMIN'].includes(userRole || '')) {
    redirect(`/${locale}/settings`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Fetch organization from database
  const organization = await getOrganizationById(organizationId)

  // If organization not found, redirect to dashboard
  if (!organization) {
    redirect(`/${locale}/dashboard`)
  }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.organization?.title || "Organization Settings",
    subtitle: dict.organization?.subtitle || "Manage your organization information",
    name: dict.organization?.name || "Name",
    namePlaceholder: dict.organization?.namePlaceholder || "Enter organization name",
    slug: dict.organization?.slug || "Slug",
    slugPlaceholder: dict.organization?.slugPlaceholder || "organization-slug",
    type: dict.organization?.type || "Type",
    description: dict.organization?.description || "Description",
    descriptionPlaceholder: dict.organization?.descriptionPlaceholder || "Enter organization description",
    website: dict.organization?.website || "Website",
    websitePlaceholder: dict.organization?.websitePlaceholder || "https://example.com",
    phone: dict.organization?.phone || "Phone",
    phonePlaceholder: dict.organization?.phonePlaceholder || "+98 912 345 6789",
    email: dict.organization?.email || "Email",
    emailPlaceholder: dict.organization?.emailPlaceholder || "contact@example.com",
    address: dict.organization?.address || "Address",
    addressPlaceholder: dict.organization?.addressPlaceholder || "Enter organization address",
    timezone: dict.organization?.timezone || "Timezone",
    timezoneTehran: dict.organization?.timezone_tehran || "Tehran (UTC+03:30)",
    timezoneDubai: dict.organization?.timezone_dubai || "Dubai (UTC+04:00)",
    timezoneLondon: dict.organization?.timezone_london || "London (UTC+00:00)",
    timezoneNewYork: dict.organization?.timezone_newyork || "New York (UTC-05:00)",
    timezoneBerlin: dict.organization?.timezone_berlin || "Berlin (UTC+01:00)",
    locale: dict.organization?.locale || "Default Language",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
    // Organization types
    lawyer: dict.organization?.lawyer || "Lawyer",
    doctor: dict.organization?.doctor || "Doctor",
    supermarket: dict.organization?.supermarket || "Supermarket",
    restaurant: dict.organization?.restaurant || "Restaurant",
    salon: dict.organization?.salon || "Salon",
    other: dict.organization?.other || "Other",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.organization?.title || "Organization Information"}</CardTitle>
          <CardDescription>
            {dict.organization?.subtitle || "Enter the basic information for your organization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t.namePlaceholder}
                defaultValue={organization.name}
                required
              />
            </div>

            {/* Organization Type */}
            <div className="space-y-2">
              <Label htmlFor="type">{t.type}</Label>
              <Select name="type" defaultValue={organization.type}>
                <SelectTrigger>
                  <SelectValue placeholder={t.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAWYER">{t.lawyer}</SelectItem>
                  <SelectItem value="DOCTOR">{t.doctor}</SelectItem>
                  <SelectItem value="SUPERMARKET">{t.supermarket}</SelectItem>
                  <SelectItem value="RESTAURANT">{t.restaurant}</SelectItem>
                  <SelectItem value="SALON">{t.salon}</SelectItem>
                  <SelectItem value="OTHER">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t.descriptionPlaceholder}
                defaultValue={organization.description || ""}
                rows={4}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">{t.website}</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder={t.websitePlaceholder}
                defaultValue={organization.website || ""}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                defaultValue={organization.phone || ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t.emailPlaceholder}
                defaultValue={organization.email || ""}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Textarea
                id="address"
                name="address"
                placeholder={t.addressPlaceholder}
                defaultValue={organization.address || ""}
                rows={3}
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">{t.timezone}</Label>
              <Select name="timezone" defaultValue={organization.timezone}>
                <SelectTrigger>
                  <SelectValue placeholder={t.timezone} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tehran">{t.timezoneTehran}</SelectItem>
                  <SelectItem value="Asia/Dubai">{t.timezoneDubai}</SelectItem>
                  <SelectItem value="Europe/London">{t.timezoneLondon}</SelectItem>
                  <SelectItem value="America/New_York">{t.timezoneNewYork}</SelectItem>
                  <SelectItem value="Europe/Berlin">{t.timezoneBerlin}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Locale */}
            <div className="space-y-2">
              <Label htmlFor="locale">{t.locale}</Label>
              <Select name="locale" defaultValue={organization.locale}>
                <SelectTrigger>
                  <SelectValue placeholder={t.locale} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fa">فارسی (FA)</SelectItem>
                  <SelectItem value="en">English (EN)</SelectItem>
                  <SelectItem value="ar">العربية (AR)</SelectItem>
                  <SelectItem value="tr">Türkçe (TR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" type="button">
                {t.cancel}
              </Button>
              <Button type="submit">
                <Save className="ml-2 h-4 w-4" />
                {t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
