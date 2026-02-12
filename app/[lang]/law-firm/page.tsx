/**
 * Law Firm Landing Page
 * 
 * A comprehensive multi-page website template for law firms.
 * Combines all law firm components into a cohesive landing page.
 * 
 * Route: /[lang]/law-firm
 */

import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import { 
  LawFirmHeader, 
  LawFirmHero, 
  LawFirmAbout,
  LawFirmPracticeAreas,
  LawFirmAttorneys,
  LawFirmTestimonials,
  LawFirmCaseResults,
  LawFirmAwards,
  LawFirmFAQ,
  LawFirmContact,
  LawFirmFooter
} from "@/components/law-firm"

// Generate static params for all supported locales
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// Type for the dictionary
type Dictionary = Record<string, unknown>

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
 * Law Firm Landing Page
 */
export default async function LawFirmPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale

  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  
  // Get some translations
  const t = {
    tagline: getTranslation(dictionary, "lawfirm.tagline", "Experience. Integrity. Results."),
    heroTitle: getTranslation(dictionary, "lawfirm.heroTitle", "Defending Your Rights, Protecting Your Future"),
    heroSubtitle: getTranslation(dictionary, "lawfirm.heroSubtitle", "Our experienced attorneys fight tirelessly to protect your interests and deliver the justice you deserve."),
    ctaText: getTranslation(dictionary, "lawfirm.ctaText", "Schedule Free Consultation"),
  }

  // Extract dictionary sections
  const navDict = {
    practiceAreas: getTranslation(dictionary, "lawfirm.navigation.practiceAreas", "Practice Areas"),
    attorneys: getTranslation(dictionary, "lawfirm.navigation.attorneys", "Attorneys"),
    about: getTranslation(dictionary, "lawfirm.navigation.about", "About Us"),
    contact: getTranslation(dictionary, "lawfirm.navigation.contact", "Contact"),
  }
  const ctaDict = {
    freeConsultation: getTranslation(dictionary, "lawfirm.cta.freeConsultation", "Schedule Free Consultation"),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LawFirmHeader locale={locale} dictionary={{ navigation: navDict, cta: ctaDict }} />

      {/* Hero Section */}
      <LawFirmHero 
        locale={locale}
        tagline={t.tagline}
        primaryHeadline={t.heroTitle}
        secondaryHeadline={t.heroSubtitle}
        primaryCTAText={t.ctaText}
      />

      {/* About Section */}
      <LawFirmAbout locale={locale} />

      {/* Practice Areas */}
      <LawFirmPracticeAreas locale={locale} />

      {/* Attorneys */}
      <LawFirmAttorneys locale={locale} />

      {/* Testimonials */}
      <LawFirmTestimonials locale={locale} />

      {/* Case Results */}
      <LawFirmCaseResults locale={locale} />

      {/* Awards */}
      <LawFirmAwards locale={locale} />

      {/* FAQ */}
      <LawFirmFAQ locale={locale} />

      {/* Contact */}
      <LawFirmContact locale={locale} />

      {/* Footer */}
      <LawFirmFooter locale={locale} />
    </div>
  )
}
