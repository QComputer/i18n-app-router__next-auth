"use client"

import * as React from "react"

export type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
  isRTL: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  lang?: string
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  lang = "fa",
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const isRTL = lang === "ar" || lang === "fa"

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const state = open ? "expanded" : "collapsed"

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        toggleSidebar,
        isRTL,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
