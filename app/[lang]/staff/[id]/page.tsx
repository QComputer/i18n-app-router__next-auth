/**
 * Staff Detail Page
 * 
 * Displays detailed information about a staff member.
 * Provides options to edit or delete the staff member.
 * 
 * Route: /[lang]/staff/[id]
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { ArrowRight, Edit, Trash2, Mail, Phone, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStaffByIdWithUser } from "@/lib/staff/staff"
import { notFound } from "next/navigation"

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
 * Staff detail page component
 * 
 * @param props.params - Promise resolving to { lang: Locale, id: string }
 */
export default async function StaffDetailPage(props: {
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
    title: dict.staff?.title || "Staff",
    staffDetails: dict.staff?.staffDetails || "Staff Details",
    name: dict.staff?.name || "Name",
    email: dict.staff?.email || "Email",
    phone: dict.staff?.phone || "Phone",
    bio: dict.staff?.bio || "Bio",
    status: dict.staff?.status || "Status",
    active: dict.staff?.active || "Active",
    inactive: dict.staff?.inactive || "Inactive",
    edit: dict.common?.edit || "Edit",
    delete: dict.common?.delete || "Delete",
    back: dict.common?.back || "Back",
    createdAt: dict.common?.createdAt || "Created",
    updatedAt: dict.common?.updatedAt || "Updated",
    noBio: locale === "fa" ? "بدون بیوگرافی" : "No bio",
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/staff`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back} {t.title}
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarImage src={staff.user?.image || undefined} alt={staff.user?.name || "Staff"} />
            <AvatarFallback className="text-lg">
              {staff.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "S"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold">{staff.user?.name || "Unknown"}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={getStatusVariant(staff.isActive)}>
                {getStatusLabel(staff.isActive, locale)}
              </Badge>
              {staff.isDefault && (
                <Badge variant="outline">
                  {locale === "fa" ? "پیش‌فرض" : "Default"}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                #{staff.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/${locale}/staff/${staffId}/edit`}>
            <Button variant="outline">
              <Edit className="ml-2 h-4 w-4" />
              {t.edit}
            </Button>
          </Link>
          <Button variant="destructive">
            <Trash2 className="ml-2 h-4 w-4" />
            {t.delete}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Staff Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t.staffDetails}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t.bio}</h3>
                <p className="text-base">
                  {staff.bio || t.noBio}
                </p>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {locale === "fa" ? "اطلاعات تماس" : "Contact Information"}
                </h3>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.email}</p>
                    <p className="font-medium">{staff.user?.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.phone}</p>
                    <p className="font-medium">{staff.user?.phone || "-"}</p>
                  </div>
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
                      ? staff.createdAt.toLocaleDateString("fa-IR")
                      : staff.createdAt.toLocaleDateString()
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.updatedAt}</span>
                  <span>
                    {locale === "fa"
                      ? staff.updatedAt.toLocaleDateString("fa-IR")
                      : staff.updatedAt.toLocaleDateString()
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{staff.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
