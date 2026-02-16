/**
 * Dashboard Page
 * 
 * A comprehensive dashboard featuring:
 * - Welcome section with user info
 * - Recent appointments with status-colored cards
 * - Role-based navigation grouped by category
 * - Responsive design
 * 
 * Route: /[lang]/dashboard
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { i18nConfig } from "@/i18n-config"
import { getAppointments } from "@/app/actions/appointments"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings, 
  Users, 
  UserCog,
  Building2,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  FileText,
  BarChart3,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// Type definitions
type Dictionary = Record<string, unknown>

type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

type NavCategory = {
  title: string
  items: NavItem[]
}

// Status colors for appointment cards
const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  PENDING: { bg: "dark:bg-yellow-950 bg-yellow-50 border-yellow-200", border: "border-yellow-300", text: "text-yellow-800" },
  CONFIRMED: { bg: "dark:bg-green-950 bg-green-50  border-green-200", border: "border-green-300", text: "text-green-800" },
  COMPLETED: { bg: "dark:bg-blue-950 bg-blue-50 border-blue-200", border: "border-blue-300", text: "text-blue-800" },
  CANCELLED: { bg: "dark:bg-red-950 border-red-200", border: "border-red-300", text: "text-red-800" },
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

/**
 * Helper function to safely get translation strings
 */
function getTranslation(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Dashboard Page Component
 */
export default async function DashboardPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale

  // Get session
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  const user = session.user
  const userRole = user.role || "CLIENT"

  // Get dictionary
  const dictionary = await getDictionary(locale) as Dictionary
  const dict = dictionary as unknown as Record<string, Record<string, string>>

  // Translations
  const t = {
    title: getTranslation(dictionary, "dashboard.title", "Dashboard"),
    welcome: getTranslation(dictionary, "server-component.welcome", "Welcome"),
    recentAppointments: getTranslation(dictionary, "dashboard.recentAppointments", "Recent Appointments"),
    viewAll: getTranslation(dictionary, "dashboard.viewAll", "View All"),
    noAppointments: getTranslation(dictionary, "dashboard.noAppointments", "No appointments found"),
    quickActions: getTranslation(dictionary, "dashboard.quickActions", "Quick Actions"),
    newAppointment: getTranslation(dictionary, "dashboard.actions.newAppointment", "New Appointment"),
    navigation: getTranslation(dictionary, "navigation", "Navigation"),
    appointments: getTranslation(dictionary, "appointment.title", "Appointments"),
    calendar: getTranslation(dictionary, "calendar.title", "Calendar"),
    services: getTranslation(dictionary, "service.title", "Services"),
    staff: getTranslation(dictionary, "staff.title", "Staff"),
    settings: getTranslation(dictionary, "settings.title", "Settings"),
    admin: getTranslation(dictionary, "admin.sidebar.title", "Administration"),
    logout: getTranslation(dictionary, "auth.signOut", "Sign Out"),
    clientName: getTranslation(dictionary, "dashboard.table.client", "Client"),
    service: getTranslation(dictionary, "appointment.service", "Service"),
    date: getTranslation(dictionary, "dashboard.table.date", "Date"),
    status: getTranslation(dictionary, "appointment.status", "Status"),
  }

  // Get user's appointments using the getAppointments action
  const { appointments } = await getAppointments({
    page: 1,
    limit: 5,
  })

  // Build navigation based on user role
  const getNavigationCategories = (): NavCategory[] => {
    const categories: NavCategory[] = []

    // Appointments & Scheduling
    categories.push({
      title: "Appointments & Scheduling",
      items: [
        { title: t.appointments, href: `/${locale}/appointments`, icon: Calendar },
        { title: t.calendar, href: `/${locale}/calendar`, icon: Clock },
      ]
    })

    // Services & Staff
    categories.push({
      title: "Services & Staff",
      items: [
        { title: t.services, href: `/${locale}/services`, icon: Briefcase },
        { title: t.staff, href: `/${locale}/settings/organization/staff`, icon: Users },
      ]
    })

    // Settings
    categories.push({
      title: t.settings,
      items: [
        { title: t.settings, href: `/${locale}/settings`, icon: Settings },
      ]
    })

    // Administration (for OWNER, MANAGER, ADMIN)
    if (["ADMIN"].includes(userRole)) {
      categories.push({
        title: t.admin,
        items: [
          { title: getTranslation(dictionary, "admin.sidebar.dashboard", "Admin Dashboard"), href: `/${locale}/admin`, icon: LayoutDashboard },
          { title: getTranslation(dictionary, "admin.sidebar.users", "Users"), href: `/${locale}/admin/users`, icon: UserCog },
          { title: getTranslation(dictionary, "admin.sidebar.organizations", "Organizations"), href: `/${locale}/admin/organizations`, icon: Building2 },
          { title: getTranslation(dictionary, "admin.sidebar.staff", "Staff"), href: `/${locale}/admin/staff`, icon: Users },
          { title: getTranslation(dictionary, "admin.sidebar.services", "Services"), href: `/${locale}/admin/services`, icon: Briefcase },
          { title: getTranslation(dictionary, "admin.sidebar.appointments", "Appointments"), href: `/${locale}/admin/appointments`, icon: Calendar },
        ]
      })
    }

    return categories
  }

  const navCategories = getNavigationCategories()

  // Format date for locale
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  // Format time for locale
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  // Get initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {t.welcome}, {user.name || user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/appointments/new`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t.newAppointment}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/signout`}>
                <Button variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Recent Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                      <p className="text-sm text-muted-foreground">{t.appointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {appointments.filter(a => a.status === "PENDING").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {appointments.filter(a => a.status === "CONFIRMED").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {appointments.filter(a => a.status === "COMPLETED").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments with Colored Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{t.recentAppointments}</CardTitle>
                  <CardDescription>Your latest appointments</CardDescription>
                </div>
                <Link href={`/${locale}/appointments`}>
                  <Button variant="ghost" className="gap-1">
                    {t.viewAll}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => {
                      const statusStyle = statusColors[appointment.status] || statusColors.PENDING
                      const clientName = appointment.client?.name || "Unknown Client"
                      
                      return (
                        <div
                          key={appointment.id}
                          className={`p-4 rounded-lg border-2 ${statusStyle.bg} ${statusStyle.border}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className={statusStyle.text}>
                                  {getInitials(clientName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className={`font-semibold ${statusStyle.text}`}>
                                  {clientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.service?.name || "Unknown Service"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDate(appointment.startTime)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    {formatTime(appointment.startTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              className={
                                appointment.status === "PENDING" ? "bg-yellow-500" :
                                appointment.status === "CONFIRMED" ? "bg-green-500" :
                                appointment.status === "COMPLETED" ? "bg-blue-500" :
                                "bg-red-500"
                              }
                            >
                              {statusLabels[appointment.status] || appointment.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t.noAppointments}</p>
                    <Link href={`/${locale}/appointments/new`}>
                      <Button variant="link" className="mt-2">
                        {t.newAppointment}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Navigation */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{user.name || user.username}</p>
                    <p className="text-sm text-muted-foreground">{(user as { email?: string }).email || ""}</p>
                    <Badge variant="secondary" className="mt-2">
                      {userRole}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Categories */}
            {navCategories.map((category, index) => (
              <Card key={category.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-sm">{item.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </Link>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            ))}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.quickActions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/${locale}/appointments/new`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    {t.newAppointment}
                  </Button>
                </Link>
                <Link href={`/${locale}/calendar`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    {t.calendar}
                  </Button>
                </Link>
                <Link href={`/${locale}/settings`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    {t.settings}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
