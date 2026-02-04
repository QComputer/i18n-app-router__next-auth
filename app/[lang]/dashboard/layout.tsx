import { redirect } from "next/navigation"
import Link from "next/link"
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, Locale } from "@/i18n-config";
import { signOutAction } from "@/app/actions/signout";


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

  const session = {
    user:{
      name: "user name"
    }
  }//await auth()
  const t = await getDictionary(locale as Locale);

  // Create bound action for sign out
  const signOut = signOutAction.bind(null, locale);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t.appointment.title}</h1>
          <p className="text-sm text-muted-foreground">{session.user?.name}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href={`/${locale}/dashboard`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t.dashboard.title}
          </Link>
          <Link
            href={`/${locale}/appointments`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t.appointment.title}
          </Link>
        </nav>

        <div className="p-4 border-t">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left rounded-lg hover:bg-accent transition-colors text-destructive"
            >
              {t.auth.signOut}
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
