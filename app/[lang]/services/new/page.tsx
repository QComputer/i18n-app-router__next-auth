/**
 * New Service Page
 * 
 * Form for creating a new service.
 * 
 * Route: /[lang]/services/new
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { createServiceAction } from "@/app/actions/services"
import { ArrowRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * New service page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function NewServicePage(props: {
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
  const organizationId = session.user.organizationId || null

  // Redirect to dashboard if no organization
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.service?.newService || "Add New Service",
    subtitle: dict.service?.newServiceSubtitle || "Create a new service for your business",
    name: dict.service?.name || "Name",
    namePlaceholder: dict.service?.namePlaceholder || "Enter service name",
    description: dict.service?.description || "Description",
    descriptionPlaceholder: dict.service?.descriptionPlaceholder || "Enter service description",
    duration: dict.service?.duration || "Duration (minutes)",
    durationPlaceholder: dict.service?.durationPlaceholder || "30",
    price: dict.service?.price || "Price",
    pricePlaceholder: dict.service?.pricePlaceholder || "0",
    color: dict.service?.color || "Color",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/services`}
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
          <form action={async (formData: FormData) => {
            "use server"
            await createServiceAction(formData, locale)
          }} className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t.namePlaceholder}
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
                rows={4}
              />
            </div>

            {/* Duration and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">{t.duration}</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder={t.durationPlaceholder}
                  min="1"
                  defaultValue="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t.price}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder={t.pricePlaceholder}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">{t.color}</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  className="w-12 h-10 p-1"
                  defaultValue="#0ea5e9"
                />
                <Input
                  placeholder="#0ea5e9"
                  defaultValue="#0ea5e9"
                  disabled
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${locale}/services`}>
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
