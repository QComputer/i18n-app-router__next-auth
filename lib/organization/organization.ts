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
 *   
 *   // Public Page Configuration
 *   heroTitle              String?
 *   heroSubtitle           String?
 *   heroBackgroundImage    String?
 *   aboutEnabled           Boolean         @default(true)
 *   aboutContent           String?         @db.Text
 *   aboutImage             String?
 *   practiceAreasEnabled   Boolean         @default(true)
 *   attorneysEnabled       Boolean         @default(true)
 *   testimonialsEnabled    Boolean         @default(true)
 *   caseResultsEnabled     Boolean         @default(true)
 *   awardsEnabled          Boolean         @default(true)
 *   faqEnabled             Boolean         @default(true)
 *   contactEnabled         Boolean         @default(true)
 *   appointmentEnabled     Boolean         @default(true)
 *   
 *   // SEO Configuration
 *   seoTitle               String?
 *   seoDescription          String?
 *   seoKeywords            String?
 *   
 *   // Contact Info
 *   mapUrl                 String?
 *   workingHours           String?
 *   emergencyPhone         String?
 *   
 *   // Social Links
 *   facebookUrl           String?
 *   twitterUrl            String?
 *   instagramUrl          String?
 *   linkedinUrl           String?
 *   telegramUrl           String?
 *   
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
import type { Organization as PrismaOrganization } from "@/lib/generated/prisma/client"
import { OrganizationType, ThemeMode } from "@/lib/generated/prisma/enums"

/**
 * Organization type definition - matches Prisma Organization model
 */
export type Organization = PrismaOrganization

/**
 * Public page configuration type
 */
export type PublicPageConfig = Pick<Organization, 
  | 'heroTitle' 
  | 'heroSubtitle' 
  | 'heroBackgroundImage' 
  | 'aboutEnabled' 
  | 'aboutContent' 
  | 'aboutImage' 
  | 'practiceAreasEnabled' 
  | 'attorneysEnabled' 
  | 'testimonialsEnabled' 
  | 'caseResultsEnabled' 
  | 'awardsEnabled' 
  | 'faqEnabled' 
  | 'contactEnabled' 
  | 'appointmentEnabled'
  | 'seoTitle'
  | 'seoDescription'
  | 'seoKeywords'
>

/**
 * Social links configuration type
 */
export type SocialLinksConfig = Pick<Organization,
  | 'facebookUrl'
  | 'twitterUrl'
  | 'instagramUrl'
  | 'linkedinUrl'
  | 'telegramUrl'
>

/**
 * Contact info configuration type
 */
export type ContactInfoConfig = Pick<Organization,
  | 'mapUrl'
  | 'workingHours'
  | 'emergencyPhone'
  | 'address'
  | 'phone'
  | 'email'
>

/**
 * Create a new organization
 * 
 * @param data - Organization creation data
 * @returns Created organization
 */
export async function createOrganization(data: {
  name: string
  slug: string
  type: typeof OrganizationType[keyof typeof OrganizationType]
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
 * Get an organization by slug with services and staff
 * 
 * @param slug - Organization slug
 * @returns Organization or null if not found
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      },
      staffs: {
        where: { isActive: true },
        include: {
          user: true
        },
        orderBy: { user: { name: 'asc' } }
      },
      businessHours: true,
    },
  })
}

/**
 * Get an organization by slug (simple version)
 * 
 * @param slug - Organization slug
 * @returns Organization or null if not found
 */
export async function getOrganizationSimpleBySlug(slug: string): Promise<Organization | null> {
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
    type?: typeof OrganizationType[keyof typeof OrganizationType]
    description?: string
    logo?: string
    website?: string
    phone?: string
    email?: string
    address?: string
    timezone?: string
    locale?: string
    themeMode?: typeof ThemeMode[keyof typeof ThemeMode]
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
 * Update organization public page configuration
 * 
 * @param id - Organization ID
 * @param data - Public page configuration data
 * @returns Updated organization
 */
export async function updateOrganizationPublicPageConfig(
  id: string,
  data: Partial<PublicPageConfig>
): Promise<Organization> {
  return prisma.organization.update({
    where: { id },
    data,
  })
}

/**
 * Update organization social links
 * 
 * @param id - Organization ID
 * @param data - Social links data
 * @returns Updated organization
 */
export async function updateOrganizationSocialLinks(
  id: string,
  data: Partial<SocialLinksConfig>
): Promise<Organization> {
  return prisma.organization.update({
    where: { id },
    data,
  })
}

/**
 * Update organization contact info
 * 
 * @param id - Organization ID
 * @param data - Contact info data
 * @returns Updated organization
 */
export async function updateOrganizationContactInfo(
  id: string,
  data: Partial<ContactInfoConfig>
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
export async function getOrganizationsByType(type: typeof OrganizationType[keyof typeof OrganizationType]): Promise<Organization[]> {
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

/**
 * Get all active organizations
 * 
 * @returns Array of active organizations
 */
export async function getAllActiveOrganizations(): Promise<Organization[]> {
  return prisma.organization.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
}

/**
 * Get organization services
 * 
 * @param organizationId - Organization ID
 * @returns Array of services
 */
export async function getOrganizationServices(organizationId: string) {
  return prisma.service.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Get organization staff with availability
 * 
 * @param organizationId - Organization ID
 * @returns Array of staff with user data
 */
export async function getOrganizationStaff(organizationId: string) {
  return prisma.staff.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    include: {
      user: true,
      availability: true,
    },
    orderBy: { user: { name: "asc" } },
  })
}

/**
 * Get organization business hours
 * 
 * @param organizationId - Organization ID
 * @returns Array of business hours
 */
export async function getOrganizationBusinessHours(organizationId: string) {
  return prisma.businessHours.findMany({
    where: { organizationId },
    orderBy: { dayOfWeek: "asc" },
  })
}
