import { notFound } from "next/navigation"
import prisma from "@/lib/db/prisma"
import { LawFirmPage } from "./law-firm-page"
import { getDictionary } from "@/get-dictionary"

type ValidLocale = "en" | "fa" | "ar" | "tr"

interface PageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export default async function LawFirmPageRoute({ params }: PageProps) {
  const { lang, slug } = await params
  
  // Validate and cast language
  const validLanguages: ValidLocale[] = ["en", "fa", "ar", "tr"]
  const validLang = validLanguages.includes(lang as ValidLocale) 
    ? (lang as ValidLocale) 
    : "fa"
  
  // Look up organization by slug with services and staff
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      // Include active staff members with their user data for the attorneys section
      // and include their services for the practice areas section
      staffs: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            }
          },
          services: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
        },
        orderBy: { user: { name: 'asc' } }
      },
    },
  })
  
  // If organization not found, show 404
  if (!organization) {
    notFound()
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(validLang)
  
  return (
    <LawFirmPage 
      organization={organization}
      dictionary={dictionary}
      lang={validLang}
    />
  )
}
