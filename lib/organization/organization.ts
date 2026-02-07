/**
 * Organization Library
 * 
 * Provides CRUD operations for organizations.
 * 
 * Prisma Schema Reference:
 * model Organization {
 *   id             String           @id @default(cuid())
 *   name           String
 *   slug           String           @unique
 *   type           OrganizationType
 *   logo           String?
 *   description    String?
 *   website        String?
 *   phone          String?
 *   email          String?
 *   address        String?
 *   timezone       String           @default("Asia/Tehran")
 *   locale         String           @default("fa")
 *   themeMode      ThemeMode        @default(SYSTEM)
 *   primaryColor   String           @default("#0ea5e9")
 *   secondaryColor String           @default("#64748b")
 *   isActive       Boolean          @default(true)
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 * 
 * enum OrganizationType {
 *   LAWYER
 *   DOCTOR
 *   SUPERMARKET
 *   RESTAURANT
 *   SALON
 *   OTHER
 * }
 * 
 * enum ThemeMode {
 *   LIGHT
 *   DARK
 *   SYSTEM
 * }
 */

import prisma from "@/lib/db/prisma"

/**
 * Organization type definition - matches Prisma Organization model
 */
export type Organization = {
  id: string
  name: string
  slug: string
  type: OrganizationType
  logo: string | null
  description: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  timezone: string
  locale: string
  themeMode: ThemeMode
  primaryColor: string
  secondaryColor: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Organization type enum
 */
export type OrganizationType = "LAWYER" | "DOCTOR" | "SUPERMARKET" | "RESTAURANT" | "SALON" | "OTHER"

/**
 * Theme mode enum
 */
export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM"

/**
 * Create a new organization
 * 
 * @param data - Organization creation data
 * @returns Created organization
 */
export async function createOrganization(data: {
  name: string
  slug: string
  type: OrganizationType
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
}): Promise<Organization> {
  return prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description || null,
      logo: data.logo || null,
      website: data.website || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      timezone: data.timezone || "Asia/Tehran",
      locale: data.locale || "fa",
      primaryColor: data.primaryColor || "#0ea5e9",
      secondaryColor: data.secondaryColor || "#64748b",
    },
  })
}

/**
 * Get an organization by ID
 * 
 * @param id - Organization ID
 * @returns Organization or null if not found
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { id },
  })
}


/**
 * Get an organization by slug
 * 
 * @param slug - Organization slug
 * @returns Organization or null if not found
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { slug },
  })
}

/**
 * Update an organization
 * 
 * @param id - Organization ID
 * @param data - Update data
 * @returns Updated organization
 */
export async function updateOrganization(
  id: string,
  data: {
    name?: string
    slug?: string
    type?: OrganizationType
    description?: string
    logo?: string
    website?: string
    phone?: string
    email?: string
    address?: string
    timezone?: string
    locale?: string
    themeMode?: ThemeMode
    primaryColor?: string
    secondaryColor?: string
    isActive?: boolean
  }
): Promise<Organization> {
  return prisma.organization.update({
    where: { id },
    data,
  })
}

/**
 * Delete an organization (soft delete)
 * 
 * @param id - Organization ID
 * @returns Updated organization
 */
export async function deleteOrganization(id: string): Promise<Organization> {
  return prisma.organization.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Hard delete an organization (permanent)
 * Use with caution - this permanently removes the organization
 * 
 * @param id - Organization ID
 */
export async function hardDeleteOrganization(id: string): Promise<void> {
  await prisma.organization.delete({
    where: { id },
  })
}

/**
 * Get organizations by type
 * 
 * @param type - Organization type
 * @returns Array of organizations
 */
export async function getOrganizationsByType(type: OrganizationType): Promise<Organization[]> {
  return prisma.organization.findMany({
    where: {
      type,
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Search organizations by name
 * 
 * @param query - Search query
 * @returns Array of matching organizations
 */
export async function searchOrganizations(query: string): Promise<Organization[]> {
  return prisma.organization.findMany({
    where: {
      isActive: true,
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Check if organization slug is available
 * 
 * @param slug - Organization slug to check
 * @param excludeId - Organization ID to exclude from check
 * @returns True if slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const where: Record<string, unknown> = { slug }
  
  if (excludeId) {
    where.id = { not: excludeId }
  }
  
  const count = await prisma.organization.count({ where })
  return count === 0
}
