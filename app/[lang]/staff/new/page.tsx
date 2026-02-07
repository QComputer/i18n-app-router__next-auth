/**
 * New Staff Page
 * 
 * Form for creating a new staff member by selecting an existing user.
 * 
 * Route: /[lang]/staff/new
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import prisma from "@/lib/db/prisma"
import { createStaff } from "@/lib/staff/staff"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Get users without staff record for an organization
 */
async function getAvailableUsers(organizationId: string) {
  // Get all users who don't have a staff record
  return prisma.user.findMany({
    where: {
      staff: null, // Users without staff record
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
    take: 100,
  })
}

/**
 * New staff page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function NewStaffPage(props: {
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

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Get available users
  const availableUsers = await getAvailableUsers(organizationId)

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.staff?.newStaff || "Add New Staff",
    subtitle: dict.staff?.newStaffSubtitle || "Add a new staff member to your team",
    name: dict.staff?.name || "Name",
    email: dict.staff?.email || "Email",
    bio: dict.staff?.bio || "Bio",
    bioPlaceholder: dict.staff?.bioPlaceholder || "Enter staff bio",
    isDefault: dict.staff?.isDefault || "Default Staff",
    isDefaultDescription: dict.staff?.isDefaultDescription || "Use as default for new bookings",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
    selectUser: dict.staff?.selectUser || "Select User",
    selectUserPlaceholder: dict.staff?.selectUserPlaceholder || "Choose a user to become staff",
    noAvailableUsers: dict.staff?.noAvailableUsers || "No available users",
    noAvailableUsersDescription: dict.staff?.noAvailableUsersDescription || "All users in your organization are already staff members.",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/staff`}
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
          <CardTitle>{t.selectUser}</CardTitle>
          <CardDescription>{t.selectUserPlaceholder}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => {
            "use server"

            const userId = formData.get("userId") as string
            const bio = formData.get("bio") as string
            const isDefault = formData.get("isDefault") === "on"
            
            if (!userId || !organizationId) {
              return
            }

            await createStaff({
              userId,
              bio: bio || undefined,
              organizationId,
            })

            redirect(`/${locale}/staff`)
          }} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="userId">{t.selectUser}</Label>
              <Select name="userId" required>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectUserPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      {t.noAvailableUsers}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {availableUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">{t.noAvailableUsersDescription}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t.bio}</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder={t.bioPlaceholder}
                rows={4}
              />
            </div>

            {/* Default Staff Switch */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isDefault" className="text-base">{t.isDefault}</Label>
                <p className="text-sm text-muted-foreground">{t.isDefaultDescription}</p>
              </div>
              <Switch id="isDefault" name="isDefault" />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${locale}/staff`}>
                <Button variant="outline" type="button">
                  {t.cancel}
                </Button>
              </Link>
              <Button type="submit" disabled={availableUsers.length === 0}>
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
