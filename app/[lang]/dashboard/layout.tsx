/**
 * Dashboard Layout (Simplified)
 * 
 * A clean, responsive layout for the authenticated dashboard area.
 * Sidebar has been removed - navigation is now integrated into the dashboard page.
 */

import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

// Generate static params for all supported locales
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// RTL locales
const RTL_LOCALES = ["ar", "fa"]

/**
 * Type definition for the dashboard dictionary structure
 */
type DashboardDict = {
  dashboard: {
    title: string
  }
  appointment: {
    title: string
  }
  calendar: {
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

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className="min-h-screen bg-background"
    >
      {children}
    </div>
  )
}
