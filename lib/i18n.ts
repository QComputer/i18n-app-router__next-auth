/**
 * i18n Initialization Utility
 * 
 * This module handles internationalization initialization for the application.
 * It provides utilities for loading translations and managing locale settings.
 * 
 * Note: For this application, we use a simpler approach with get-dictionary.ts
 * for loading translations. This file is kept for potential future use
 * with more complex i18n requirements.
 */

import { Resource, createInstance, i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { i18nConfig } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import type { Locale } from '@/i18n-config';

/**
 * Initialize translations for a given locale
 * 
 * This function sets up i18next with React integration and loads
 * translation resources for the specified locale.
 * 
 * @param locale - The locale to initialize translations for
 * @param namespaces - Optional array of translation namespaces to load
 * @returns Promise resolving to i18n instance, resources, and translation function
 */
export async function initTranslations(
  locale: Locale,
  namespaces: string[] = ['common']
) {
  // For this application, we use get-dictionary which already loads
  // the full dictionary. For more complex apps with code-splitting,
  // we could use the resourcesToBackend approach.
  
  const dictionary = await getDictionary(locale);
  
  const instance = createInstance();
  instance.use(initReactI18next);
  
  await instance.init({
    lng: locale,
    resources: {
      [locale]: {
        [namespaces[0]]: dictionary,
      },
    },
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
  
  return {
    i18n: instance,
    resources: { [locale]: dictionary },
    t: instance.t,
  };
}

/**
 * Get the direction (RTL/LTR) for a given locale
 * 
 * @param locale - The locale to check
 * @returns 'rtl' for right-to-left languages, 'ltr' for others
 */
export function getLocaleDirection(locale: Locale): 'rtl' | 'ltr' {
  const rtlLocales = ['fa', 'ar'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the display name for a locale
 * 
 * @param locale - The locale code
 * @returns The localized display name of the language
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    fa: 'فارسی',
    en: 'English',
    ar: 'العربية',
    tr: 'Türkçe',
  };
  return displayNames[locale] || locale;
}

/**
 * Validate that a locale is supported
 * 
 * @param locale - The locale to validate
 * @returns True if the locale is in the supported list
 */
export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}
