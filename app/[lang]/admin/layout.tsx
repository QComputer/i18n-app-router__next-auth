import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { AdminSidebar } from "@/components/ui/sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, Record<string, string>>

  return (
    <div className="flex h-screen">
      <AdminSidebar lang={lang} dict={dict as any} user={user} />
      
      <main className="flex-1 overflow-y-auto lg:pl-0 pl-16">
        <header className="bg-card border-b p-4 flex justify-between items-center lg:hidden">
          <h1 className="text-xl font-semibold">{(dict as any)?.admin?.header?.welcome || "Welcome"}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.name || user.username}
            </span>
            <a
              href={`/${lang}/auth/signout`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {(dict as any)?.auth?.signOut || "Sign Out"}
            </a>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
