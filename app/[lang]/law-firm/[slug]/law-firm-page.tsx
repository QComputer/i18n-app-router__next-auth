"use client"

import type { Organization, Staff } from "@/lib/generated/prisma/client"
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
import { AppointmentBooking } from "@/components/law-firm/appointment-booking"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary = any

interface LawFirmPageProps {
  organization: Organization & {
    /**
     * Staff members to display in the attorneys section.
     * This data is fetched from the database and passed to the component.
     * Each staff member includes their user data (name, email, image, etc.)
     */
    staffs?: Array<{
      id: string
      bio: string | null
      hierarchy: string
      isActive: boolean
      isDefault: boolean
      user: {
        id: string
        name: string | null
        email: string | null
        phone: string | null
        image: string | null
      }
    }>
    /**
     * Services to display in the practice areas section.
     */
    services?: Array<{
      id: string
      name: string
      description: string | null
    }>
  }
  dictionary: Dictionary
  lang: string
}

export function LawFirmPage({ organization, dictionary, lang }: LawFirmPageProps) {
  const isRtl = lang === "fa" || lang === "ar"
  
  // Get section visibility settings with defaults
  const showHero = organization.heroTitle || organization.heroSubtitle
  const showAbout = organization.aboutEnabled !== false
  const showPracticeAreas = organization.practiceAreasEnabled !== false
  const showAttorneys = organization.attorneysEnabled !== false
  const showTestimonials = organization.testimonialsEnabled !== false
  const showCaseResults = organization.caseResultsEnabled !== false
  const showAwards = organization.awardsEnabled !== false
  const showFaq = organization.faqEnabled !== false
  const showContact = organization.contactEnabled !== false
  const showAppointment = organization.appointmentEnabled !== false
  
  // Build dictionary for header
  const headerDict = {
    navigation: {
      practiceAreas: dictionary.lawfirm?.navigation?.practiceAreas || "Practice Areas",
      attorneys: dictionary.lawfirm?.navigation?.attorneys || "Attorneys",
      about: dictionary.lawfirm?.navigation?.about || "About Us",
      contact: dictionary.lawfirm?.navigation?.contact || "Contact"
    },
    cta: {
      freeConsultation: dictionary.lawfirm?.cta?.freeConsultation || "Schedule Free Consultation"
    }
  }
  
  // Build lawfirmData dictionary with organization info
  const lawfirmDataDict = {
    contact: {
      phone: {
        title: dictionary.contact?.phone || "Phone",
        subtitle: dictionary.contact?.emergency || "24/7 Emergency Line",
        number: organization.phone || "1-800-JUSTICE"
      },
      email: {
        title: dictionary.contact?.email || "Email",
        subtitle: dictionary.contact?.emailSubtitle || "General Inquiries",
        address: organization.email || "info@justicelaw.com"
      },
      address: {
        title: dictionary.contact?.address || "Main Office",
        fullAddress: organization.address || "123 Main Street"
      },
      hours: {
        title: dictionary.contact?.hours || "Business Hours",
        weekday: organization.workingHours || "Mon-Fri: 8AM - 6PM",
        saturday: "Sat: 9AM - 1PM",
        sunday: "Sun: Closed"
      }
    }
  }
  
  return (
    <div className={isRtl ? "rtl" : "ltr"} dir={isRtl ? "rtl" : "ltr"}>
      <LawFirmHeader 
        locale={lang}
        dictionary={headerDict}
      />
      
      <main>
        {showHero && (
          <LawFirmHero 
            locale={lang}
            tagline={dictionary.lawfirm?.tagline || "Experience. Integrity. Results."}
            primaryHeadline={organization.heroTitle || dictionary.lawfirm?.heroTitle || "Defending Your Rights, Protecting Your Future"}
            secondaryHeadline={organization.heroSubtitle || dictionary.lawfirm?.heroSubtitle || ""}
            primaryCTAText={dictionary.lawfirm?.ctaText || "Schedule Free Consultation"}
          />
        )}
        
        {showAbout && (
          <LawFirmAbout 
            locale={lang}
            dictionary={{
              lawfirm: {
                about: {
                  title: dictionary.lawfirm?.about?.title || "About Our Firm",
                  subtitle: organization.aboutContent || dictionary.lawfirm?.about?.subtitle || "",
                  historyTitle: dictionary.lawfirm?.about?.historyTitle || "Our History",
                  history1: dictionary.lawfirm?.about?.history1 || "",
                  history2: dictionary.lawfirm?.about?.history2 || "",
                  history3: dictionary.lawfirm?.about?.history3 || "",
                  valuesTitle: dictionary.lawfirm?.about?.valuesTitle || "Our Core Values",
                  yearsExperience: dictionary.lawfirm?.about?.yearsExperience || "Years of Experience",
                  casesResolved: dictionary.lawfirm?.about?.casesResolved || "Cases Resolved"
                }
              }
            }}
          />
        )}
        
        {showPracticeAreas && (
          <LawFirmPracticeAreas 
            locale={lang}
            dictionary={dictionary}
          />
        )}
        
        {showAttorneys && (
          <LawFirmAttorneys 
            locale={lang}
            dictionary={dictionary}
            /**
             * Pass staff members from the organization to display in the attorneys section.
             * This enables dynamic staff display based on the organization's actual staff.
             */
            staff={organization.staffs || []}
          />
        )}
        
        {showTestimonials && (
          <LawFirmTestimonials 
            locale={lang}
            dictionary={dictionary}
          />
        )}
        
        {showCaseResults && (
          <LawFirmCaseResults 
            locale={lang}
            dictionary={dictionary}
          />
        )}
        
        {showAwards && (
          <LawFirmAwards 
            locale={lang}
            dictionary={dictionary}
          />
        )}
        
        {showFaq && (
          <LawFirmFAQ 
            locale={lang}
            dictionary={dictionary}
          />
        )}
        
        {showContact && (
          <LawFirmContact 
            locale={lang}
            dictionary={{
              ...dictionary,
              lawfirmData: lawfirmDataDict
            }}
          />
        )}
        
        {showAppointment && (
          <AppointmentBooking 
            organization={organization}
            dictionary={dictionary}
            lang={lang}
          />
        )}
      </main>
      
      <LawFirmFooter 
        locale={lang}
        dictionary={dictionary}
      />
    </div>
  )
}
