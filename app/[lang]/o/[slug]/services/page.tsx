/**
 * Organization Services Page
 * 
 * Server component that fetches organization data with service categories and services.
 * Displays services organized by categories with booking functionality.
 * 
 * Route: /[lang]/o/[slug]/services
 */

import { notFound } from "next/navigation"
import prisma from "@/lib/db/prisma"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import OrganizationServicesClient from "./client"

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

export default async function OrganizationServicesPage({ params }: PageProps) {
  const { lang, slug } = await params
  
  // Validate and cast language
  const validLanguages: ValidLocale[] = ["en", "fa", "ar", "tr"]
  const validLang = validLanguages.includes(lang as ValidLocale) 
    ? (lang as ValidLocale) 
    : "fa"
  
  // Look up organization by slug with service categories and services
  const organization = await prisma.organization.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      timezone: true,
      locale: true,
    },
  })
  
  // If organization not found, show 404
  if (!organization) {
    notFound()
  }
  
  // Fetch service categories with their services and staff
  const serviceCategories = await prisma.serviceCategory.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: { name: "asc" },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  })
  
  // Get dictionary for translations
  const dictionary = await getDictionary(validLang)
  console.log(serviceCategories);
  
  
  return (
    <OrganizationServicesClient
      organization={organization}
      serviceCategories={serviceCategories}
      dictionary={dictionary as Record<string, unknown>}
      lang={validLang}
    />
  )
}
