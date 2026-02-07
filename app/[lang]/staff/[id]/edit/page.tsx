/**
 * Edit Staff Page
 * 
 * Form for editing an existing staff member.
 * 
 * Route: /[lang]/staff/[id]/edit
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
import { Switch } from "@/components/ui/switch"
import { getStaffByIdWithUser, updateStaff } from "@/lib/staff/staff"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Edit staff page component
 * 
 * @param props.params - Promise resolving to { lang: Locale, id: string }
 */
export default async function EditStaffPage(props: {
  params: Promise<{ lang: string; id: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  const staffId = params.id

  // Get current session
  const session = await auth()

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Fetch staff from database
  const staff = await getStaffByIdWithUser(staffId)

  // If staff not found, redirect to staff list
  if (!staff) {
    redirect(`/${locale}/staff`)
  }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.staff?.editStaff || "Edit Staff",
    subtitle: dict.staff?.editStaffSubtitle || "Update staff member information",
    name: dict.staff?.name || "Name",
    namePlaceholder: dict.staff?.namePlaceholder || "Enter staff name",
    email: dict.staff?.email || "Email",
    emailPlaceholder: dict.staff?.emailPlaceholder || "Enter email address",
    phone: dict.staff?.phone || "Phone",
    phonePlaceholder: dict.staff?.phonePlaceholder || "Enter phone number",
    bio: dict.staff?.bio || "Bio",
    bioPlaceholder: dict.staff?.bioPlaceholder || "Enter staff bio",
    isDefault: dict.staff?.isDefault || "Default Staff",
    isDefaultDescription: dict.staff?.isDefaultDescription || "Use as default for new bookings",
    isActive: dict.staff?.active || "Active",
    isActiveDescription: dict.staff?.isActiveDescription || "Staff member is available for bookings",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
    userId: dict.staff?.userId || "User",
    userIdDescription: dict.staff?.userIdDescription || "Select the user to associate with this staff member",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/staff/${staffId}`}
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
          <CardDescription>{t.bio}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => {
            "use server"
            
            // This would handle form submission
            // For now, we'll just redirect back to the staff detail page
            redirect(`/${locale}/staff/${staffId}`)
          }} className="space-y-6">
            {/* Read-only User Info */}
            <div className="space-y-2">
              <Label htmlFor="userInfo">{t.userId}</Label>
              <Input
                id="userInfo"
                type="text"
                value={staff.user?.name || "Unknown"}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">{t.userIdDescription}</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t.bio}</Label>
              <Textarea
                id="bio"
                placeholder={t.bioPlaceholder}
                defaultValue={staff.bio || ""}
                rows={4}
              />
            </div>

            {/* Default Staff Switch */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isDefault" className="text-base">{t.isDefault}</Label>
                <p className="text-sm text-muted-foreground">{t.isDefaultDescription}</p>
              </div>
              <Switch 
                id="isDefault" 
                defaultChecked={staff.isDefault}
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isActive" className="text-base">{t.isActive}</Label>
                <p className="text-sm text-muted-foreground">{t.isActiveDescription}</p>
              </div>
              <Switch 
                id="isActive" 
                defaultChecked={staff.isActive}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${locale}/staff/${staffId}`}>
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
