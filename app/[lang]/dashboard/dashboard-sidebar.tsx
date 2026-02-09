"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  CalendarClock, 
  Settings,
  LogOut,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  href: string
  icon: React.ElementType
}

interface DashboardSidebarProps {
  locale: string
  dict: any
  session: any
  children: React.ReactNode
}

export function DashboardSidebar({ locale, dict, session, children }: DashboardSidebarProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isRTL = locale === "ar"

  const handleNavigate = (href: string) => {
    setMobileOpen(false)
    router.push(href)
  }

  const menuItems: MenuItem[] = [
    { title: dict?.dashboard?.title || "Dashboard", href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { title: dict?.appointment?.title || "Appointments", href: `/${locale}/appointments`, icon: CalendarClock },
  ]

  // Add services link if user has access
  if (session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER" || session?.user?.role === "SUPER_ADMIN") {
    menuItems.push({ title: dict?.admin?.sidebar?.services || "Services", href: `/${locale}/services`, icon: Settings })
  }

  const renderSidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{dict?.appointment?.title || "Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">
          {session.user?.name || session.user?.username || "User"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Role: {session.user?.role}
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigate(item.href)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </button>
        ))}
        {(session.user?.role === "ADMIN" || session.user?.role === "MANAGER" || session.user?.role === "SUPER_ADMIN") && (
          <button
            onClick={() => handleNavigate(`/${locale}/admin`)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
          >
            <Settings className="h-5 w-5" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t">
        <Link
          href={`/${locale}/auth/signout`}
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors",
            "text-destructive"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>{dict?.auth?.signOut || "Sign Out"}</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside 
        className={cn(
          "w-64 border-r bg-card hidden md:flex flex-col",
          isRTL ? "order-2" : "order-1"
        )}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile header and drawer */}
      <div className={cn(
        "md:hidden fixed top-0 z-50 bg-background border-b w-full",
        isRTL ? "left-0" : "left-0"
      )}>
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-bold">{dict?.dashboard?.title || "Dashboard"}</h1>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-0">
              <SheetHeader>
                <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full bg-card">
                {renderSidebarContent()}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 overflow-auto md:pt-0 pt-16",
        isRTL ? "order-1" : "order-2"
      )}>
        {children}
      </div>
    </div>
  )
}
