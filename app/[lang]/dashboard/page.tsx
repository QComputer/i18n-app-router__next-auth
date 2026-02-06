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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{dictionary.dashboard.title}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {user.name || user.username}!
          </h2>
          <p className="text-muted-foreground">
            Manage your appointments and settings from this dashboard.
          </p>
        </div>

        {/* User Info Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <div className="space-y-2">
            <p><span className="text-muted-foreground">Username:</span> {user.username}</p>
            <p><span className="text-muted-foreground">Role:</span> {user.role}</p>
            {user.email && (
              <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href={`/${locale}/appointments`} className="block p-2 rounded hover:bg-accent">
              📅 {dictionary.appointment.title}
            </a>
            <a href={`/${locale}/settings`} className="block p-2 rounded hover:bg-accent">
              ⚙️ {dictionary.settings.title}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
