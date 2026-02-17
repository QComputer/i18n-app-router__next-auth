import { notFound } from "next/navigation"
import prisma from "@/lib/db/prisma"
import { RestaurantPageClient } from "./restaurant-page-client"
import { getDictionary } from "@/get-dictionary"
import { auth } from "@/lib/auth"

type ValidLocale = "en" | "fa" | "ar" | "tr"

interface PageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export default async function RestaurantPageRoute({ params }: PageProps) {
  const { lang, slug } = await params
  
  const validLanguages: ValidLocale[] = ["en", "fa", "ar", "tr"]
  const validLang = validLanguages.includes(lang as ValidLocale) ? (lang as ValidLocale) : "fa"
  
  const session = await auth()
  
  const organization = await prisma.organization.findUnique({
    where: { slug, organizationType: "RESTAURANT" },
    include: {
      products: {
        where: { isActive: true },
        include: { productCategory: true },
        orderBy: { name: 'asc' }
      },
      staffs: {
        where: { isActive: true },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, image: true } }
        },
        orderBy: { user: { name: 'asc' } }
      },
    },
  })
  
  if (!organization) notFound()
  
  let isOwner = false
  if (session?.user) {
    const ownerStaff = await prisma.staff.findFirst({
      where: { organizationId: organization.id, hierarchy: "OWNER", userId: session.user.id }
    })
    isOwner = !!ownerStaff
  }
  
  const followerCount = await prisma.following.count({
    where: { targetId: organization.id, TargetType: "ORGANIZATION" }
  })
  
  const dictionary = await getDictionary(validLang)
  
  return (
    <RestaurantPageClient 
      organization={organization}
      dictionary={dictionary}
      lang={validLang}
      isOwner={isOwner}
      followerCount={followerCount}
    />
  )
}
