/**
 * Profile Settings Page
 * 
 * Page component that allows users to manage their profile settings.
 * Users can update their name, email, phone, and preferred language.
 * 
 * Route: /[lang]/settings/profile
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProfileForm } from "./profile-form";

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
 * Main profile settings page component
 */
export default async function ProfileSettingsPage(props: {
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
      phone: true,
      username: true,
      image: true,
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
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm 
        locale={locale} 
        user={user} 
        dictionary={dictionary} 
      />
    </div>
  );
}
