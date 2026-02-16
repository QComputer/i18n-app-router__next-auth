/**
 * Organization General Settings Page
 * 
 * Form for editing organization general settings.
 * 
 * Route: /[lang]/settings/organization/general
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ToastProvider } from "@/components/ui/toast"
import { getOrganizationById } from "@/lib/organization/organization"
import { GeneralForm } from "./general-form"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Organization general settings page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function OrganizationGeneralSettingsPage(props: {
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

  // Get user's organization ID
  const organizationId = session.user.organizationId || null

  // Redirect to dashboard if no organization
  if (!organizationId) {
      redirect(`/${locale}/settings`)
  }

  // Check user role - only OWNER and ADMIN can access organization settings
  const userRole = session.user.role
  if (!['OWNER', 'ADMIN'].includes(userRole || '')) {
    redirect(`/${locale}/settings`)
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)

  // Fetch organization from database
  const organization = await getOrganizationById(organizationId)

  // If organization not found, redirect to settings
  if (!organization) {
    redirect(`/${locale}/settings`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/settings/organization`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {/* @ts-expect-error - dictionary type is a union, not all variants have back */}
        {dictionary.common?.back || "Back"}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {/* @ts-expect-error - dictionary type is a union */}
          {dictionary.organization?.title || "Organization Settings"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {/* @ts-expect-error - dictionary type is a union */}
          {dictionary.organization?.subtitle || "Manage your organization information"}
        </p>
      </div>

      {/* Form */}
      <ToastProvider>
        <GeneralForm 
          organization={organization} 
          dictionary={dictionary}
          locale={locale}
        />
      </ToastProvider>
    </div>
  )
}
