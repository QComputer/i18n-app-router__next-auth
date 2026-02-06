import { redirect } from "next/navigation"
import Link from "next/link"
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import { signOutAction } from "@/app/actions/signout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang;
  const { children } = props;
  
  // Get the session using auth() from lib/auth (which uses NextAuth)
  const session = await auth();
  
  // If no session, redirect to signin
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }
  
  const t = await getDictionary(locale as Locale);
  
  // Create bound action for sign out with locale
  const signOut = signOutAction.bind(null, locale);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t.appointment.title || "Dashboard"}</h1>
          <p className="text-sm text-muted-foreground">
            {session.user?.name || session.user?.username || "User"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Role: {session.user?.role}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href={`/${locale}/dashboard`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t.dashboard?.title || "Dashboard"}
          </Link>
          <Link
            href={`/${locale}/appointments`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t.appointment?.title || "Appointments"}
          </Link>
          {(session.user?.role === "ADMIN" || session.user?.role === "MANAGER" || session.user?.role === "SUPER_ADMIN") && (
            <Link
              href={`/${locale}/admin`}
              className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left rounded-lg hover:bg-accent transition-colors text-destructive"
            >
              {t.auth?.signOut || "Sign Out"}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-bold">{t.dashboard?.title || "Dashboard"}</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="px-3 py-1 text-sm rounded-lg bg-destructive text-destructive-foreground"
            >
              {t.auth?.signOut || "Sign Out"}
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto md:pt-0 pt-16">
        {children}
      </div>
    </div>
  )
}
