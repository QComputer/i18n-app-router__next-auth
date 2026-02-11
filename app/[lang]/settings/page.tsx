/**
 * Settings Index Page
 * 
 * Redirects to the profile settings page by default.
 * 
 * Route: /[lang]/settings
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Locale } from "@/i18n-config";

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fa" }, { lang: "ar" }, { lang: "tr" }];
}

/**
 * Main settings index page - redirects to profile settings
 */
export default async function SettingsIndexPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang as Locale;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/settings`);
  }

  // Redirect to profile settings
  redirect(`/${locale}/settings/profile`);
}
