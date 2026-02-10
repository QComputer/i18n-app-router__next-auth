"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/hooks/use-sidebar"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarVariants = cva(
  "flex flex-col bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-r",
      },
      size: {
        default: "w-64",
        sm: "w-48",
        lg: "w-72",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  lang?: string
}

interface SidebarComponent extends React.ForwardRefExoticComponent<SidebarProps> {
  Header: typeof SidebarHeader
  Content: typeof SidebarContent
  Footer: typeof SidebarFooter
  Group: typeof SidebarGroup
  Menu: typeof SidebarMenu
  MenuItem: typeof SidebarMenuItem
  MenuButton: typeof SidebarMenuButton
  Trigger: typeof SidebarTrigger
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, size, lang = "en", children, ...props }, ref) => {
    const { isRTL } = useSidebar()

    return (
      <aside
        ref={ref}
        className={cn(
          "hidden lg:flex flex-col bg-card transition-all duration-300",
          "border-r",
          isRTL ? "border-l" : "border-r",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-b", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto py-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t mt-auto", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-2", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isActive?: boolean
  }
>(({ className, isActive, asChild, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isRTL } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className={cn(className)}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// Desktop sidebar - auto-adapts to RTL via dir attribute
const DesktopSidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, lang = "en", ...props }, ref) => {
    const { isRTL, state, toggleSidebar } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "hidden lg:flex flex-col bg-card transition-all duration-300",
          "border-r",
          isRTL ? "border-l" : "border-r",
          state === "collapsed" ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        <div className="p-3 border-b flex items-center">
          {state !== "collapsed" && (
            <h1 className="text-l font-semibold">Collapse</h1>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0 ms-auto"
            )}
          >
            {state === "collapsed" ? (
              <>{!isRTL?
                <ChevronRight className="h-4 w-4" />
                :
                <ChevronLeft className="h-4 w-4" />
              }</>
            ) : (
              <>{!isRTL?
                  <ChevronLeft className="h-4 w-4" />
                :
                  <ChevronRight className="h-4 w-4" />
              }</>
            )}
          </Button>
        </div>
        {children}
      </div>
    )
  }
)
DesktopSidebar.displayName = "DesktopSidebar"

// Mobile sidebar trigger - positioned correctly for RTL
const MobileSidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onOpenChange?: (open: boolean) => void }
>(({ className, onOpenChange, ...props }, ref) => {
  const { isRTL } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "lg:hidden fixed top-4 z-50",
        isRTL ? "right-4" : "left-4",
        className
      )}
      onClick={() => onOpenChange?.(true)}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  )
})
MobileSidebarTrigger.displayName = "MobileSidebarTrigger"

;(Sidebar as SidebarComponent).Header = SidebarHeader
;(Sidebar as SidebarComponent).Content = SidebarContent
;(Sidebar as SidebarComponent).Footer = SidebarFooter
;(Sidebar as SidebarComponent).Group = SidebarGroup
;(Sidebar as SidebarComponent).Menu = SidebarMenu
;(Sidebar as SidebarComponent).MenuItem = SidebarMenuItem
;(Sidebar as SidebarComponent).MenuButton = SidebarMenuButton
;(Sidebar as SidebarComponent).Trigger = SidebarTrigger

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  DesktopSidebar,
  MobileSidebarTrigger,
  sidebarVariants,
}
