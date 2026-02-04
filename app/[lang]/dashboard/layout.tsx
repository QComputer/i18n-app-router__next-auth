import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"


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
  const t = await getTranslations({ locale, namespace: "dashboard" })

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{session.user?.name}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href={`/${locale}/dashboard`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t("dashboard")}
          </Link>
          <Link
            href={`/${locale}/appointments`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t("appointments")}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t("services")}
          </Link>
          <Link
            href={`/${locale}/staff`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t("staff")}
          </Link>
          <Link
            href={`/${locale}/settings`}
            className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {t("settings")}
          </Link>
        </nav>

        <div className="p-4 border-t">
          <form
            action={async () => {
              redirect(`/${locale}/auth/signin`)
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-2 text-left rounded-lg hover:bg-accent transition-colors text-destructive"
            >
              {t("logout")}
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
