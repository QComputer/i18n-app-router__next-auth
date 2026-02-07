/**
 * Edit Service Page
 * 
 * Form for editing an existing service.
 * 
 * Route: /[lang]/services/[id]/edit
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
import { getServiceById, updateService } from "@/lib/services/service"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Edit service page component
 * 
 * @param props.params - Promise resolving to { lang: Locale, id: string }
 */
export default async function EditServicePage(props: {
  params: Promise<{ lang: string; id: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  const serviceId = params.id

  // Get current session
  const session = await auth()

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Fetch service from database
  const service = await getServiceById(serviceId)

  // If service not found, redirect to services list
  if (!service) {
    redirect(`/${locale}/services`)
  }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.service?.editService || "Edit Service",
    subtitle: dict.service?.editServiceSubtitle || "Update service information",
    name: dict.service?.name || "Name",
    namePlaceholder: dict.service?.namePlaceholder || "Enter service name",
    description: dict.service?.description || "Description",
    descriptionPlaceholder: dict.service?.descriptionPlaceholder || "Enter service description",
    duration: dict.service?.duration || "Duration (minutes)",
    durationPlaceholder: dict.service?.durationPlaceholder || "30",
    price: dict.service?.price || "Price",
    pricePlaceholder: dict.service?.pricePlaceholder || "0",
    color: dict.service?.color || "Color",
    currency: dict.service?.currency || "Currency",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
  }

  // Predefined duration options
  const durationOptions = [15, 30, 45, 60, 90, 120]

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/services/${serviceId}`}
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
          <CardTitle>{t.name}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => {
            "use server"

            // This would handle form submission
            // For now, we'll just redirect back to the service detail page
            redirect(`/${locale}/services/${serviceId}`)
          }} className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t.namePlaceholder}
                defaultValue={service.name}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t.descriptionPlaceholder}
                defaultValue={service.description || ""}
                rows={4}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">{t.duration}</Label>
              <Select name="duration" defaultValue={service.duration.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder={t.durationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((minutes) => (
                    <SelectItem key={minutes} value={minutes.toString()}>
                      {minutes} {locale === "fa" ? "دقیقه" : "minutes"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder={t.pricePlaceholder}
                defaultValue={service.price?.toString() || "0"}
                min="0"
                step="0.01"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${locale}/services/${serviceId}`}>
                <Button variant="outline" type="button">
                  {t.cancel}
                </Button>
              </Link>
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
