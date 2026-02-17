/**
 * Organization Public Profile Page
 * 
 * Server component that fetches organization data for public profile.
 * Includes follow functionality and displays organization information.
 * 
 * Route: /[lang]/o/[slug]
 */

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig } from "@/i18n-config"
import { OrganizationProfileClient } from "./organization-profile-client"

type ValidLocale = "en" | "fa" | "ar" | "tr"

interface PageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

export default async function OrganizationProfilePage({ params }: PageProps) {
  const { lang, slug } = await params
  
  // Validate and cast language
  const validLanguages: ValidLocale[] = ["en", "fa", "ar", "tr"]
  const validLang = validLanguages.includes(lang as ValidLocale) 
    ? (lang as ValidLocale) 
    : "fa"
  
  // Look up organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug, isActive: true },
    include: {
      serviceCategories: {
        orderBy: { name: "asc" },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            include: {
              staff: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      products: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          productCategory: true,
        },
      },
      staffs: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  })
  
  // If organization not found, show 404
  if (!organization) {
    notFound()
  }
  
  // Check if current user is following this organization
  const session = await auth()
  const isFollowing = session?.user ? await checkIsFollowing(session.user.id, organization.id) : false
  
  // Get follower count
  const followerCount = await prisma.following.count({
    where: {
      targetId: organization.id,
      TargetType: "ORGANIZATION"
    }
  })
  
  // Get dictionary for translations
  const dictionary = await getDictionary(validLang)
  
  return (
    <OrganizationProfileClient
      organization={organization}
      isFollowing={isFollowing}
      followerCount={followerCount}
      dictionary={dictionary as Record<string, unknown>}
      lang={validLang}
    />
  )
}

async function checkIsFollowing(userId: string, targetId: string): Promise<boolean> {
  const follow = await prisma.following.findUnique({
    where: {
      userId_targetId_TargetType: {
        userId,
        targetId,
        TargetType: "ORGANIZATION" as const
      }
    }
  })
  
  return !!follow
}
