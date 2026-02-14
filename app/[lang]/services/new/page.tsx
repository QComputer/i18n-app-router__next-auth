/**
 * New Service Page
 * 
 * Form for creating a new service.
 * Supports staff selection for OWNER users.
 * 
 * Route: /[lang]/services/new
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import Link from "next/link"
import { createServiceAction } from "@/app/actions/services"
import { ArrowRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

  // Get user's organization ID and staff ID
  const organizationId = session.user.organizationId || null
  const staffId = session.user.staffId || null

  // Redirect to dashboard if no organization
  if (!organizationId || !staffId) {
    redirect(`/${locale}/dashboard`)
  }

  // Get user's staff record to check hierarchy
  const currentStaff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      hierarchy: true,
    },
  })

  // Get service categories for the organization
  const serviceCategories = await prisma.serviceCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  })

  // For OWNER hierarchy, get all staff in the organization for selection
  let staffMembers: { id: string; user: { name: string | null } }[] = []
  if (currentStaff?.hierarchy === "OWNER") {
    staffMembers = await prisma.staff.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    })
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
    category: dict.service?.category || "Category",
    categoryPlaceholder: dict.service?.categoryPlaceholder || "Select a category",
    staff: dict.service?.staff || "Staff",
    staffPlaceholder: dict.service?.staffPlaceholder || "Select staff member",
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

            {/* Service Category */}
            <div className="space-y-2">
              <Label htmlFor="serviceCategoryId">{t.category}</Label>
              <select
                id="serviceCategoryId"
                name="serviceCategoryId"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue=""
              >
                <option value="" disabled>{t.categoryPlaceholder}</option>
                {serviceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Selection - Only for OWNER */}
            {currentStaff?.hierarchy === "OWNER" && staffMembers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="staffId">{t.staff}</Label>
                <select
                  id="staffId"
                  name="staffId"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={staffId}
                >
                  <option value="" disabled>{t.staffPlaceholder}</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.user.name || "Unnamed Staff"}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
