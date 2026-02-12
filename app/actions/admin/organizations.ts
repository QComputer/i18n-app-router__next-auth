"use server";

/**
 * Admin Organization Management Server Actions
 * 
 * Provides server-side CRUD operations for managing organizations with admin privileges.
 * These actions are only accessible to authenticated admin users.
 */

import prisma from "@/lib/db/prisma"
import { requireAdmin } from "@/lib/auth/admin"

/**
 * Get all organizations with optional filtering and pagination
 */
export async function getOrganizations(params: {
  active?: boolean
  type?: string
  page?: number
  limit?: number
  search?: string
}) {
  await requireAdmin()

  const {
    active,
    type,
    page = 1,
    limit = 50,
    search = "",
  } = params

  const where: Record<string, any> = {}

  if (active !== undefined) {
    where.isActive = active
  }

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        staffs: {
          include: {
            user: true,
          },
        },
        services: true,
        appointments: true,
      },
    }),
    prisma.organization.count({ where }),
  ])

  return {
    organizations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a single organization by ID
 */
export async function getOrganizationById(id: string) {
  await requireAdmin()

  return prisma.organization.findUnique({
    where: { id },
    include: {
      staffs: {
        include: {
          user: true,
        },
      },
      services: true,
      appointments: {
        include: {
          service: true,
        },
      },
      businessHours: true,
      holidays: true,
    },
  })
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string
  slug: string
  type: 'LAWYER' | 'DOCTOR' | 'SUPERMARKET' | 'RESTAURANT' | 'SALON' | 'OTHER'
  description?: string
  logo?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  timezone?: string
  locale?: string
  primaryColor?: string
  secondaryColor?: string
}) {
  await requireAdmin()

  const {
    name,
    slug,
    type,
    description,
    logo,
    website,
    phone,
    email,
    address,
    timezone = "Asia/Tehran",
    locale = "fa",
    primaryColor = "#0ea5e9",
    secondaryColor = "#64748b",
  } = data

  const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-")

  return prisma.organization.create({
    data: {
      name,
      slug: normalizedSlug,
      type,
      description: description || null,
      logo: logo || null,
      website: website || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      timezone,
      locale,
      primaryColor,
      secondaryColor,
    },
  })
}

/**
 * Update organization details
 */
export async function updateOrganization(id: string, data: Partial<{
  name?: string
  slug?: string
  type?: 'LAWYER' | 'DOCTOR' | 'SUPERMARKET' | 'RESTAURANT' | 'SALON' | 'OTHER'
  description?: string
  logo?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  timezone?: string
  locale?: string
  themeMode?: 'LIGHT' | 'DARK' | 'SYSTEM'
  primaryColor?: string
  secondaryColor?: string
  isActive?: boolean
}>) {
  await requireAdmin()

  const updateData: Record<string, any> = { ...data }

  // Normalize slug if updated
  if (updateData.slug) {
    updateData.slug = updateData.slug.trim().toLowerCase().replace(/\s+/g, "-")
  }

  return prisma.organization.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete an organization (soft delete or hard delete)
 */
export async function deleteOrganization(id: string, hardDelete = false) {
  await requireAdmin()

  if (hardDelete) {
    return prisma.organization.delete({
      where: { id },
    })
  }

  return prisma.organization.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Toggle organization active/inactive status
 */
export async function toggleOrganizationStatus(id: string, isActive: boolean) {
  await requireAdmin()

  return prisma.organization.update({
    where: { id },
    data: { isActive },
  })
}

/**
 * Update organization public page configuration
 */
export async function updateOrganizationPublicPageConfig(id: string, data: {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroBackgroundImage?: string | null
  aboutEnabled?: boolean
  aboutContent?: string | null
  aboutImage?: string | null
  practiceAreasEnabled?: boolean
  attorneysEnabled?: boolean
  testimonialsEnabled?: boolean
  caseResultsEnabled?: boolean
  awardsEnabled?: boolean
  faqEnabled?: boolean
  contactEnabled?: boolean
  appointmentEnabled?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
}) {
  await requireAdmin()

  return prisma.organization.update({
    where: { id },
    data,
  })
}

/**
 * Update organization social links
 */
export async function updateOrganizationSocialLinks(id: string, data: {
  facebookUrl?: string | null
  twitterUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  telegramUrl?: string | null
}) {
  await requireAdmin()

  return prisma.organization.update({
    where: { id },
    data,
  })
}

/**
 * Update organization contact info
 */
export async function updateOrganizationContactInfo(id: string, data: {
  mapUrl?: string | null
  workingHours?: string | null
  emergencyPhone?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
}) {
  await requireAdmin()

  return prisma.organization.update({
    where: { id },
    data,
  })
}
