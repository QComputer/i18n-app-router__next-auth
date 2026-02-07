/**
 * Staff List Page
 * 
 * Displays a list of staff members for the organization.
 * Supports viewing, creating, editing, and deleting staff members.
 * 
 * Route: /[lang]/staff
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { Plus, Mail, Phone, Edit, Trash2, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStaffByOrganizationWithUser } from "@/lib/staff/staff"

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
 * Staff list page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function StaffPage(props: {
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
    title: dict.staff?.title || "Staff",
    listDescription: dict.staff?.listDescription || "Manage your staff members",
    newStaff: dict.staff?.newStaff || "Add New Staff",
    name: dict.staff?.name || "Name",
    email: dict.staff?.email || "Email",
    phone: dict.staff?.phone || "Phone",
    status: dict.staff?.status || "Status",
    active: dict.staff?.active || "Active",
    inactive: dict.staff?.inactive || "Inactive",
    edit: dict.common?.edit || "Edit",
    delete: dict.common?.delete || "Delete",
    search: dict.common?.search || "Search",
    noStaff: dict.staff?.noStaff || "No staff members found",
    noStaffDescription: dict.staff?.noStaffDescription || "You don't have any staff members yet. Add your first staff member to get started.",
  }

  // Fetch staff members from database
  const staffMembers = await getStaffByOrganizationWithUser(organizationId)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.listDescription}</p>
        </div>

        {/* New Staff Button */}
        <Link href={`/${locale}/staff/new`}>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            {t.newStaff}
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

      {/* Staff List */}
      {staffMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.noStaff}</h3>
            <p className="text-muted-foreground text-center mb-4">{t.noStaffDescription}</p>
            <Link href={`/${locale}/staff/new`}>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t.newStaff}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={staff.user?.image || undefined} alt={staff.user?.name || "Staff"} />
                    <AvatarFallback className="text-lg">
                      {staff.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "S"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <h3 className="font-semibold text-lg">{staff.user?.name || "Unknown"}</h3>

                  {/* Status Badge */}
                  <Badge variant={getStatusVariant(staff.isActive)} className="mt-2">
                    {staff.isActive ? t.active : t.inactive}
                  </Badge>

                  {/* Contact Info */}
                  <div className="w-full mt-4 space-y-2 text-sm text-muted-foreground">
                    {staff.user?.email && (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{staff.user.email}</span>
                      </div>
                    )}
                    {staff.user?.phone && (
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{staff.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 w-full">
                    <Link href={`/${locale}/staff/${staff.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        {t.edit}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
