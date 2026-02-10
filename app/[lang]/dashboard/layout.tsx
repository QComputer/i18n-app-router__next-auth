import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import { auth } from "@/lib/auth"
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
import { LayoutDashboard, CalendarClock, Settings, LogOut } from "lucide-react"

// Generate static params for all supported locales
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}


// RTL locales array (Arabic and Farsi)
const RTL_LOCALES = ["ar", "fa"]

// Type definition for the dashboard dictionary structure
type DashboardDict = {
  dashboard: {
    title: string
  }
  appointment: {
    title: string
  }
  admin: {
    sidebar: {
      services: string
    }
  }
  auth: {
    signOut: string
  }
}

export default async function DashboardLayout(props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  // Await params to get the language
  const params = await props.params
  const lang = params.lang
  const { children } = props

  // Get current user session
  const session = await auth()
  const user = session?.user

  // Redirect to sign in if no session
  if (!user) {
    redirect(`/${lang}/auth/signin`)
  }

  // Get dictionary for the current locale
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as DashboardDict
  
  // Determine if current language is RTL
  const isRTL = RTL_LOCALES.includes(lang)

  // Navigation menu items
  const menuItems = [
    { title: dict.dashboard.title, href: `/${lang}/dashboard`, icon: LayoutDashboard },
    { title: dict.appointment.title, href: `/${lang}/appointments`, icon: CalendarClock },
  ]

  // Add admin-only menu items if user has access
  if (session.user?.role === "ADMIN") {
    menuItems.push({ title: dict.admin.sidebar.services, href: `/${lang}/services`, icon: Settings })
  }

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
              {menuItems.length>0 && menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {session.user?.role === "ADMIN" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={`/${lang}/admin`}>
                      <Settings className="h-5 w-5 shrink-0" />
                      <span>Admin</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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
                <span>{dict.auth.signOut}</span>
              </a>
              </div>
            </div>
          </SidebarContent>
        </DesktopSidebar>

        <MobileSidebarTrigger />
        <div className="flex-1 overflow-auto ps-16 lg:ps-0 lg:pe-16">

        <header className="p-4 border-none flex">
          <h1 className="text-l font-bold">{dict.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground px-10">
            {user?.name || user?.username || "User"}
          </p>
          <p className="text-sm text-muted-foreground px-10">
            Role: {user?.role}
          </p>
          </header>

          
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
