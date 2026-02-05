"use server";

import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { i18nConfig, type Locale } from '@/i18n-config';

/**
 * Sign out action
 * 
 * Server action that handles user sign-out.
 * Clears the session and redirects to the sign-in page.
 * 
 * @param locale - The current locale for redirection
 */
export async function signOutAction(locale: string) {
  // Validate locale or use default
  const validLocale = i18nConfig.locales.includes(locale as Locale) 
    ? locale 
    : i18nConfig.defaultLocale;

  try {
    // Sign out without redirect (NextAuth v5)
    await signOut({
      redirect: false,
    });
  } catch (error) {
    // Ignore redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Redirect was thrown, continue to our redirect
    } else {
      console.error('[SignOut] Error:', error);
    }
  }
  
  // Redirect to sign-in page with locale
  redirect(`/${validLocale}/auth/signin`);
}
