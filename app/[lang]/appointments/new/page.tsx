/**
 * New Appointment Booking Wizard - Server Component
 * 
 * This is the server component that fetches data and passes it to the client wizard.
 * 
 * Route: /[lang]/appointments/new
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import NewAppointmentClient from "./client"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Server component that fetches data and renders the client wizard
 */
export default async function NewAppointmentPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  
  // Get current session
  const session = await auth()
  
  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  
  // Get user's organization ID
  const organizationId = session.user.organizationId || "default"
  
  // Fetch services
  const services = await prisma.service.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      description: true,
      color: true,
    },
  })
  
  // Fetch staff members
  const staffMembers = await prisma.staff.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  })
  
  // Render client component with fetched data
  return (
    <NewAppointmentClient
      locale={locale}
      dictionary={dictionary as Record<string, unknown>}
      services={services}
      staffMembers={staffMembers}
      organizationId={organizationId}
    />
  )
}
