/**
 * Theme Settings Page
 * 
 * Page component that allows users to manage their theme preferences.
 * Users can select light, dark, or system theme.
 * 
 * Route: /[lang]/settings/theme
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Palette, Sun, Moon, Monitor } from "lucide-react";
import { ThemeForm } from "./theme-form";

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// Type for the dictionary
type Dictionary = Record<string, unknown>;

/**
 * Helper function to safely get translation strings
 */
function getTranslation(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Main theme settings page component
 */
export default async function ThemeSettingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang as Locale;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      themeMode: true,
      locale: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale) as unknown as Dictionary;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        Back
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Theme</h1>
        <p className="text-muted-foreground mt-1">
          Customize the appearance of the application
        </p>
      </div>

      {/* Theme Form */}
      <ThemeForm 
        locale={locale} 
        user={user} 
        dictionary={dictionary} 
      />
    </div>
  );
}
