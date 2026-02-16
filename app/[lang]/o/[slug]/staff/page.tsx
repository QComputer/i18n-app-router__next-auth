/**
 * Organization Staff Page
 * 
 * Server component that fetches organization staff members grouped by ServiceField.
 * Displays staff organized by their service field categories.
 * 
 * Route: /[lang]/o/[slug]/staff
 */

import { notFound } from "next/navigation"
import { getStaffByOrganizationSlug } from "@/app/actions/staff"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import OrganizationStaffClient from "./client"

type ValidLocale = "en" | "fa" | "ar" | "tr"

interface PageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  
  const data = await getStaffByOrganizationSlug(slug)
  
  if (!data?.organization) {
    return {
      title: "Staff Not Found",
    }
  }
  
  return {
    title: `${data.organization.name} - Staff`,
    description: `Meet our professional staff at ${data.organization.name}`,
  }
}

export default async function OrganizationStaffPage({ params }: PageProps) {
  const { lang, slug } = await params
  
  // Validate and cast language
  const validLanguages: ValidLocale[] = ["en", "fa", "ar", "tr"]
  const validLang = validLanguages.includes(lang as ValidLocale) 
    ? (lang as ValidLocale) 
    : "fa"
  
  // Fetch staff data grouped by ServiceField
  const staffData = await getStaffByOrganizationSlug(slug)
  
  // If organization not found, show 404
  if (!staffData || !staffData.organization) {
    notFound()
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(validLang)
  
  return (
    <OrganizationStaffClient
      organization={staffData.organization}
      serviceFields={staffData.serviceFields}
      unassignedStaff={staffData.unassignedStaff}
      dictionary={dictionary as Record<string, unknown>}
      lang={validLang}
    />
  )
}
