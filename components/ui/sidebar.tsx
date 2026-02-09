"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCog, 
  Briefcase, 
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
}

interface SidebarNavContentProps {
  menuItems: SidebarItem[]
  lang: string
  user: {
    name?: string | null
    username?: string | null
    email?: string | null
    image?: string | null
  }
  dict: any
  onNavigate?: () => void
}

function SidebarNavContent({ menuItems, lang, user, dict, onNavigate }: SidebarNavContentProps) {
  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={`/${lang}${item.href}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "text-muted-foreground"
                )}
                onClick={onNavigate}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback>
              {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-3">
          <a
            href={`/${lang}/auth/signout`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>{dict?.admin?.header?.logout || "Sign Out"}</span>
          </a>
        </div>
      </div>
    </>
  )
}

interface AdminSidebarProps {
  lang: string
  dict: any
  user: {
    name?: string | null
    username?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminSidebar({ lang, dict, user }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Check if locale is RTL (Arabic is RTL)
  const isRTL = lang === "ar"

  const menuItems: SidebarItem[] = [
    { title: dict?.admin?.sidebar?.dashboard || "Dashboard", href: `/admin`, icon: LayoutDashboard },
    { title: dict?.admin?.sidebar?.users || "Users", href: `/admin/users`, icon: Users },
    { title: dict?.admin?.sidebar?.organizations || "Organizations", href: `/admin/organizations`, icon: Building2 },
    { title: dict?.admin?.sidebar?.staff || "Staff", href: `/admin/staff`, icon: UserCog },
    { title: dict?.admin?.sidebar?.services || "Services", href: `/admin/services`, icon: Briefcase },
    { title: dict?.admin?.sidebar?.appointments || "Appointments", href: `/admin/appointments`, icon: CalendarClock },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <div className={cn("lg:hidden fixed top-4 z-50", isRTL ? "right-4" : "left-4")}>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full bg-card">
              {/* Mobile header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{dict?.admin?.sidebar?.title || "Admin Panel"}</h2>
              </div>
              
              {/* Mobile navigation and user */}
              <SidebarNavContent 
                menuItems={menuItems} 
                lang={lang} 
                user={user} 
                dict={dict}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          isRTL ? "order-2" : "order-1"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{dict?.admin?.sidebar?.title || "Admin Panel"}</h2>
          </div>

          {/* Navigation and user */}
          <SidebarNavContent 
            menuItems={menuItems} 
            lang={lang} 
            user={user} 
            dict={dict}
          />

          {/* Collapse toggle */}
          <div className="border-t p-2 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  {isRTL ? <ChevronRight className="h-4 w-4 mr-2" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
