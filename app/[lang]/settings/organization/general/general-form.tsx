"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionToast } from "@/lib/hooks/use-toast-actions"
import { updateMyOrganization } from "@/app/actions/organizations"
import type { Organization } from "@/lib/generated/prisma/client"

interface GeneralFormProps {
  organization: Organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any
  locale: string
}

export function GeneralForm({ organization, dictionary, locale }: GeneralFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useActionToast()
  
  // Get translations with fallbacks
  const dict = dictionary.organization || {}
  const commonDict = dictionary.common || {}
  
  const t = {
    title: dict.title || "Organization Settings",
    subtitle: dict.subtitle || "Manage your organization information",
    name: dict.name || "Name",
    namePlaceholder: dict.namePlaceholder || "Enter organization name",
    slug: dict.slug || "Slug",
    slugPlaceholder: dict.slugPlaceholder || "organization-slug",
    type: dict.type || "Type",
    description: dict.description || "Description",
    descriptionPlaceholder: dict.descriptionPlaceholder || "Enter organization description",
    website: dict.website || "Website",
    websitePlaceholder: dict.websitePlaceholder || "https://example.com",
    phone: dict.phone || "Phone",
    phonePlaceholder: dict.phonePlaceholder || "+98 912 345 6789",
    email: dict.email || "Email",
    emailPlaceholder: dict.emailPlaceholder || "contact@example.com",
    address: dict.address || "Address",
    addressPlaceholder: dict.addressPlaceholder || "Enter organization address",
    timezone: dict.timezone || "Timezone",
    timezoneTehran: dict.timezone_tehran || "Tehran (UTC+03:30)",
    timezoneDubai: dict.timezone_dubai || "Dubai (UTC+04:00)",
    timezoneLondon: dict.timezone_london || "London (UTC+00:00)",
    timezoneNewYork: dict.timezone_newyork || "New York (UTC-05:00)",
    timezoneBerlin: dict.timezone_berlin || "Berlin (UTC+01:00)",
    locale: dict.locale || "Default Language",
    save: commonDict.save || "Save",
    cancel: commonDict.cancel || "Cancel",
    back: commonDict.back || "Back",
    // Organization types
    lawyer: dict.lawyer || "Lawyer",
    doctor: dict.doctor || "Doctor",
    supermarket: dict.supermarket || "Supermarket",
    restaurant: dict.restaurant || "Restaurant",
    salon: dict.salon || "Salon",
    other: dict.other || "Other",
    // Messages
    saveSuccess: commonDict.success || "Success",
    saveError: commonDict.error || "Error",
    saving: "Saving...",
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    
    try {
      await updateMyOrganization({
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        type: formData.get("type") as "LAWYER" | "DOCTOR" | "SUPERMARKET" | "RESTAURANT" | "SALON" | "OTHER",
        description: formData.get("description") as string || undefined,
        website: formData.get("website") as string || undefined,
        phone: formData.get("phone") as string || undefined,
        email: formData.get("email") as string || undefined,
        address: formData.get("address") as string || undefined,
        timezone: formData.get("timezone") as string,
        locale: formData.get("locale") as string,
      })
      
      success(t.saveSuccess, "Organization settings saved successfully")
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (err) {
      console.error("Error updating organization:", err)
      error(
        t.saveError,
        err instanceof Error ? err.message : "Failed to save organization settings"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Organization Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">{t.slug}</Label>
            <Input
              id="slug"
              name="slug"
              placeholder={t.slugPlaceholder}
              defaultValue={organization.slug}
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
            <Button variant="outline" type="button" onClick={() => router.back()}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="ml-2 h-4 w-4" />
              )}
              {isSubmitting ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
