/**
 * Organization Public Page Settings Page
 * 
 * Allows OWNER/MANAGER users to customize their organization's public landing page.
 * This includes hero content, about section, section visibility, SEO settings,
 * contact information, and social media links.
 * 
 * Route: /[lang]/settings/organization/public-page
 * 
 * @module app/[lang]/settings/organization/public-page/page
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import Link from "next/link";
import { ArrowRight, Globe, ExternalLink } from "lucide-react";
import { PublicPageConfigForm } from "@/components/settings/public-page-config-form";
import { getMyOrganization, getMyOrganizationPublicUrl } from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/ui/toast";

/**
 * Generate static params for all supported locales
 * Required for Next.js static export support
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

/**
 * Helper function to safely get translation strings
 */
function getTranslation(dictionary: Record<string, unknown>, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Organization Public Page Settings Page Component
 * 
 * This page provides a comprehensive interface for organization owners to
 * manage all aspects of their public landing page content.
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function OrganizationPublicPageSettings(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang as Locale;

  // Get current session - require authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale);

  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>;
  const t = {
    title: getTranslation(dictionary, "settings.organization.publicPage.title", "Public Page Settings"),
    subtitle: getTranslation(dictionary, "settings.organization.publicPage.subtitle", "Customize how your organization appears to visitors"),
    back: getTranslation(dictionary, "common.back", "Back"),
    organizationSettings: getTranslation(dictionary, "settings.organization.title", "Organization Settings"),
    publicPage: getTranslation(dictionary, "settings.organization.publicPage.title", "Public Page"),
    viewPublicPage: getTranslation(dictionary, "settings.organization.publicPage.viewPublicPage", "View Public Page"),
    noOrganization: getTranslation(dictionary, "settings.organization.noOrganization", "No organization linked to your account"),
    contactAdmin: getTranslation(dictionary, "settings.organization.contactAdmin", "Please contact an administrator"),
  };

  try {
    // Fetch the current user's organization
    // This will throw an error if the user doesn't have an organization
    const organization = await getMyOrganization();

    if (!organization) {
      return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.noOrganization}</h2>
            <p className="text-muted-foreground">{t.contactAdmin}</p>
          </div>
        </div>
      );
    }

    // Get the public page URL for the "View Public Page" link
    const publicPageUrl = await getMyOrganizationPublicUrl(locale);

    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href={`/${locale}/settings`}
            className="hover:text-primary transition-colors"
          >
            {t.organizationSettings}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t.publicPage}</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          
          {publicPageUrl && (
            <Link href={publicPageUrl} target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {t.viewPublicPage}
              </Button>
            </Link>
          )}
        </div>

        {/* Public Page Configuration Form */}
        {/* This form allows editing all aspects of the public landing page */}
        <ToastProvider>
          <PublicPageConfigForm
            organization={organization}
            dictionary={dictionary}
            lang={locale}
          />
        </ToastProvider>
      </div>
    );
  } catch (error) {
    // Handle authorization errors (user doesn't have permission)
    console.error("Error loading organization public page settings:", error);
    
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {error instanceof Error ? error.message : t.noOrganization}
          </h2>
          <p className="text-muted-foreground">{t.contactAdmin}</p>
          
          <Link href={`/${locale}/dashboard`}>
            <Button variant="link" className="mt-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              {t.back}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
