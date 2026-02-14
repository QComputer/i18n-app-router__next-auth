import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { SidebarProvider } from "@/lib/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import {
  DesktopSidebar,
  MobileSidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  Briefcase,
  CalendarClock,
  LogOut,
} from "lucide-react"

export const dynamic = "force-dynamic"


type AdminDict = {
  admin: {
    sidebar: {
      dashboard: string
      users: string
      organizations: string
      staff: string
      services: string
      appointments: string
      title: string
      collapse: string
    }
    header: {
      logout: string
      welcome: string
    }
  }
}

const RTL_LOCALES = ["ar", "fa"]

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
  const dict = dictionary as unknown as AdminDict
  const isRTL = RTL_LOCALES.includes(lang)

  const menuItems = [
    { title: dict.admin.sidebar.dashboard, href: `/admin`, icon: LayoutDashboard },
    { title: dict.admin.sidebar.users, href: `/admin/users`, icon: Users },
    { title: dict.admin.sidebar.organizations, href: `/admin/organizations`, icon: Building2 },
    { title: dict.admin.sidebar.staff, href: `/admin/staff`, icon: UserCog },
    { title: dict.admin.sidebar.services, href: `/admin/services`, icon: Briefcase },
    { title: dict.admin.sidebar.appointments, href: `/admin/appointments`, icon: CalendarClock },
  ]

  return (
    <SidebarProvider lang={lang}>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        lang={lang}
        className={cn("flex h-screen antialiased")}
      >
        <DesktopSidebar lang={lang}>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={`/${lang}${item.href}`}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarContent>
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">
                    {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || user.username}</p>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href={`/${lang}/auth/signout`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{dict.admin.header.logout}</span>
                </a>
              </div>
            </div>
          </SidebarContent>
        </DesktopSidebar>

        <MobileSidebarTrigger />

        <main className="flex-1 overflow-y-auto ps-16 lg:ps-0 lg:pe-16">
          <header className="bg-card border-b p-4 flex justify-between items-center lg:hidden">
            <h1 className="text-xl font-semibold">{dict.admin.header.welcome}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name || user.username}
              </span>
              <a
                href={`/${lang}/auth/signout`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {dict.admin.header.logout}
              </a>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
