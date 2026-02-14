/**
 * Service Categories Management Page Server Component
 * 
 * Server component that fetches service categories and renders the client component.
 * 
 * Route: /[lang]/settings/organization/categories
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import ServiceCategoriesPageClient from "./client"

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

interface ServiceCategoryData {
  id: string
  name: string
  description: string | null
  organizationId: string
  _count: {
    services: number
  }
}

export default async function ServiceCategoriesPage(props: {
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

  const organizationId = session.user.organizationId
  
  // Redirect to dashboard if no organization
  if (!organizationId) {
    redirect(`/${locale}/dashboard`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  const dict = dictionary as unknown as Record<string, Record<string, string>>

  // Get service categories for the organization
  const categories: ServiceCategoryData[] = await prisma.serviceCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { services: true },
      },
    },
  })

  const t = {
    title: dict.service?.categoriesTitle || "Service Categories",
    description: dict.service?.categoriesDescription || "Organize your services into categories",
    newCategory: dict.service?.newCategory || "Add New Category",
    name: dict.service?.categoryName || "Category Name",
    namePlaceholder: dict.service?.categoryNamePlaceholder || "Enter category name",
    descriptionLabel: dict.service?.description || "Description",
    descriptionPlaceholder: dict.service?.categoryDescriptionPlaceholder || "Enter category description (optional)",
    edit: dict.common?.edit || "Edit",
    delete: dict.common?.delete || "Delete",
    save: dict.common?.save || "Save",
    cancel: dict.common?.cancel || "Cancel",
    back: dict.common?.back || "Back",
    noCategories: dict.service?.noCategories || "No categories found",
    noCategoriesDescription: dict.service?.noCategoriesDescription || "Create your first category to organize services.",
    services: dict.service?.services || "Services",
  }

  return (
    <ServiceCategoriesPageClient 
      categories={categories} 
      t={t}
      locale={locale}
    />
  )
}
