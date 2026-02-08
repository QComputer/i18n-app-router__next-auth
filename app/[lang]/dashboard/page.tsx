import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary";
import { type Locale } from "@/i18n-config";

export const dynamic = "force-dynamic"

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const dictionary = (await getDictionary(locale as Locale));

  // Get the session
  const session = await auth()

  // If no session, redirect to signin
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  const user = session.user as { id: string; username: string; role: string; name?: string | null; email?: string | null }

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.dashboard?.title || "Dashboard",
    welcome: dict.serverComponent?.welcome || "Welcome",
    manage: dict.dashboard?.title || "Manage your appointments and settings from this dashboard.",
    profile: dict.settings?.profile || "Profile",
    username: dict.auth?.username || "Username:",
    role: dict.navigation?.role || "Role:",
    email: dict.auth?.email || "Email:",
    appointments: dict.appointment?.title || "Appointments",
    settings: dict.settings?.title || "Settings",
    appointmentsLink: dict.navigation?.appointments || "Appointments",
    settingsLink: dict.navigation?.settings || "Settings",
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">
            {t.welcome}, {user.name || user.username}!
          </h2>
          <p className="text-muted-foreground">
            {t.manage}
          </p>
        </div>

        {/* User Info Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">{t.profile}</h3>
          <div className="space-y-2">
            <p><span className="text-muted-foreground">{t.username}</span> {user.username}</p>
            <p><span className="text-muted-foreground">{t.role}</span> {user.role}</p>
            {user.email && (
              <p><span className="text-muted-foreground">{t.email}</span> {user.email}</p>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">{t.title}</h3>
          <div className="space-y-2">
            <a href={`/${locale}/appointments`} className="block p-2 rounded hover:bg-accent">
              📅 {t.appointmentsLink}
            </a>
            <a href={`/${locale}/settings`} className="block p-2 rounded hover:bg-accent">
              ⚙️ {t.settingsLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
