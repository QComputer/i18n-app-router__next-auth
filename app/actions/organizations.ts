/**
 * Organization Management Server Actions for OWNER/MANAGER Users
 * 
 * Provides server-side operations for managing organization settings,
 * including public page configuration. These actions are accessible to
 * authenticated users with OWNER or MANAGER roles who have a linked organization.
 * 
 * @module app/actions/organizations
 */

"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Type definitions for public page configuration
 * These mirror the Prisma Organization model fields for public page content
 */
export interface PublicPageConfig {
  // Hero Section
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroBackgroundImage?: string | null;
  
  // About Section
  aboutEnabled?: boolean;
  aboutContent?: string | null;
  aboutImage?: string | null;
  
  // Section Visibility
  practiceAreasEnabled?: boolean;
  attorneysEnabled?: boolean;
  testimonialsEnabled?: boolean;
  caseResultsEnabled?: boolean;
  awardsEnabled?: boolean;
  faqEnabled?: boolean;
  contactEnabled?: boolean;
  appointmentEnabled?: boolean;
  
  // SEO
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

/**
 * Social links configuration type
 */
export interface SocialLinksConfig {
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  telegramUrl?: string | null;
}

/**
 * Contact info configuration type
 */
export interface ContactInfoConfig {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  mapUrl?: string | null;
  workingHours?: string | null;
  emergencyPhone?: string | null;
}

/**
 * Get the current user's organization
 * 
 * Retrieves the organization linked to the authenticated user.
 * Requires the user to have an OWNER, MANAGER, or STAFF role with a linked organization.
 * 
 * @returns The user's organization or null if not found
 * @throws Error if user is not authenticated
 */
export async function getMyOrganization() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const organizationId = session.user.organizationId;
  
  if (!organizationId) {
    throw new Error("No organization linked to this account");
  }
  
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
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
      serviceCategories: {
        where: { },
        orderBy: { name: 'asc' }
      },
    },
  });
  
  return organization;
}

/**
 * Update organization public page configuration
 * 
 * Allows OWNER/MANAGER users to update their organization's public page settings.
 * This includes hero content, about section, section visibility toggles, and SEO settings.
 * 
 * @param data - Public page configuration data to update
 * @returns Updated organization
 * @throws Error if user is not authorized
 * 
 * @example
 * ```typescript
 * await updateMyOrganizationPublicPage({
 *   heroTitle: "Welcome to Our Law Firm",
 *   heroSubtitle: "Experienced attorneys fighting for your rights",
 *   aboutEnabled: true,
 *   aboutContent: "Our firm has been serving...",
 *   attorneysEnabled: true,
 *   seoTitle: "Best Law Firm in Tehran",
 *   seoDescription: "Expert legal services..."
 * });
 * ```
 */
export async function updateMyOrganizationPublicPage(data: PublicPageConfig) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const organizationId = session.user.organizationId;
  
  if (!organizationId) {
    throw new Error("No organization linked to this account");
  }
  
  // Check user role - allow OWNER, MANAGER, or ADMIN
  const userRole = session.user.role;
  if (!['OWNER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    throw new Error("You don't have permission to update organization settings");
  }
  
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      // Hero Section
      heroTitle: data.heroTitle ?? undefined,
      heroSubtitle: data.heroSubtitle ?? undefined,
      heroBackgroundImage: data.heroBackgroundImage ?? undefined,
      
      // About Section
      aboutEnabled: data.aboutEnabled,
      aboutContent: data.aboutContent ?? undefined,
      aboutImage: data.aboutImage ?? undefined,
      
      // Section Visibility
      practiceAreasEnabled: data.practiceAreasEnabled,
      attorneysEnabled: data.attorneysEnabled,
      testimonialsEnabled: data.testimonialsEnabled,
      caseResultsEnabled: data.caseResultsEnabled,
      awardsEnabled: data.awardsEnabled,
      faqEnabled: data.faqEnabled,
      contactEnabled: data.contactEnabled,
      appointmentEnabled: data.appointmentEnabled,
      
      // SEO
      seoTitle: data.seoTitle ?? undefined,
      seoDescription: data.seoDescription ?? undefined,
      seoKeywords: data.seoKeywords ?? undefined,
    },
  });
  
  // Revalidate the public page and settings pages
  revalidatePath('/[lang]/law-firm/[slug]');
  revalidatePath('/[lang]/settings/organization');
  
  return organization;
}

/**
 * Update organization social links
 * 
 * Allows OWNER/MANAGER users to update their organization's social media presence.
 * 
 * @param data - Social links configuration
 * @returns Updated organization
 * @throws Error if user is not authorized
 */
export async function updateMyOrganizationSocialLinks(data: SocialLinksConfig) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const organizationId = session.user.organizationId;
  
  if (!organizationId) {
    throw new Error("No organization linked to this account");
  }
  
  const userRole = session.user.role;
  if (!['OWNER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    throw new Error("You don't have permission to update organization settings");
  }
  
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      facebookUrl: data.facebookUrl ?? undefined,
      twitterUrl: data.twitterUrl ?? undefined,
      instagramUrl: data.instagramUrl ?? undefined,
      linkedinUrl: data.linkedinUrl ?? undefined,
      telegramUrl: data.telegramUrl ?? undefined,
    },
  });
  
  revalidatePath('/[lang]/settings/organization');
  
  return organization;
}

/**
 * Update organization contact information
 * 
 * Allows OWNER/MANAGER users to update their organization's contact details.
 * This information is displayed on the public landing page.
 * 
 * @param data - Contact information configuration
 * @returns Updated organization
 * @throws Error if user is not authorized
 * 
 * @example
 * ```typescript
 * await updateMyOrganizationContactInfo({
 *   address: "123 Main Street, Tehran, Iran",
 *   phone: "+98 21 1234 5678",
 *   email: "info@example.com",
 *   workingHours: "Mon-Fri: 9AM-6PM",
 *   mapUrl: "https://maps.google.com/..."
 * });
 * ```
 */
export async function updateMyOrganizationContactInfo(data: ContactInfoConfig) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const organizationId = session.user.organizationId;
  
  if (!organizationId) {
    throw new Error("No organization linked to this account");
  }
  
  const userRole = session.user.role;
  if (!['OWNER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    throw new Error("You don't have permission to update organization settings");
  }
  
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      address: data.address ?? undefined,
      phone: data.phone ?? undefined,
      email: data.email ?? undefined,
      mapUrl: data.mapUrl ?? undefined,
      workingHours: data.workingHours ?? undefined,
      emergencyPhone: data.emergencyPhone ?? undefined,
    },
  });
  
  // Revalidate pages that show contact info
  revalidatePath('/[lang]/law-firm/[slug]');
  revalidatePath('/[lang]/settings/organization');
  
  return organization;
}

/**
 * Update basic organization information
 * 
 * Allows OWNER/MANAGER users to update core organization details like
 * name, description, website, and branding colors.
 * 
 * @param data - Basic organization data
 * @returns Updated organization
 * @throws Error if user is not authorized
 */
export async function updateMyOrganization(data: {
  name?: string;
  slug?: string;
  organizationType?: "LAWYER" | "DOCTOR" | "MARKET" | "RESTAURANT" | "SALON" | "OTHER";
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  locale?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const organizationId = session.user.organizationId;
  
  if (!organizationId) {
    throw new Error("No organization linked to this account");
  }
  
  const userRole = session.user.role;
  if (!['OWNER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    throw new Error("You don't have permission to update organization settings");
  }
  
  // If slug is being changed, check for uniqueness
  if (data.slug) {
    const existingOrg = await prisma.organization.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: organizationId }
      }
    });
    
    if (existingOrg) {
      throw new Error("This URL slug is already in use by another organization");
    }
  }
  
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: data.name,
      slug: data.slug,
      organizationType: data.organizationType,
      description: data.description ?? undefined,
      logo: data.logo ?? undefined,
      website: data.website ?? undefined,
      phone: data.phone ?? undefined,
      email: data.email ?? undefined,
      address: data.address ?? undefined,
      timezone: data.timezone,
      locale: data.locale,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
    },
  });
  
  revalidatePath('/[lang]/settings/organization');
  revalidatePath('/[lang]/settings/organization/general');
  
  return organization;
}

/**
 * Get the public page URL for the current user's organization
 * 
 * @returns The public landing page URL or null if no organization
 */
export async function getMyOrganizationPublicUrl(lang: string = 'fa') {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return null;
  }
  
  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { slug: true },
  });
  
  if (!organization?.slug) {
    return null;
  }
  
  return `/${lang}/law-firm/${organization.slug}`;
}

/**
 * Verify that the current user has permission to manage the organization
 * 
 * This function checks both the user's role and their staff hierarchy
 * to ensure they have appropriate permissions.
 * 
 * @returns The staff record if authorized, null otherwise
 * @throws Error if not authenticated or not authorized
 */
export async function verifyOrganizationAccess(): Promise<{
  staffId: string;
  hierarchy: string;
  organizationId: string;
} | null> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  const { user } = session;
  
  // ADMIN users can manage any organization
  if (user.role === 'ADMIN') {
    if (!user.organizationId) {
      throw new Error("Admin user must have an organization linked");
    }
    return {
      staffId: user.staffId || '',
      hierarchy: 'ADMIN',
      organizationId: user.organizationId
    };
  }
  
  // Check for organization link
  if (!user.organizationId) {
    return null;
  }
  
  // Get staff record to check hierarchy
  const staff = await prisma.staff.findFirst({
    where: {
      userId: user.id,
      organizationId: user.organizationId,
      isActive: true
    }
  });
  
  if (!staff) {
    return null;
  }
  
  // Check if user has appropriate hierarchy
  if (!['OWNER', 'MANAGER'].includes(staff.hierarchy)) {
    return null;
  }
  
  return {
    staffId: staff.id,
    hierarchy: staff.hierarchy,
    organizationId: staff.organizationId
  };
}

/**
 * Get users for a specific organization
 * 
 * This function is used by organization admins (OWNER, MANAGER) to get
 * a list of users that can be assigned as staff to their organization.
 * 
 * @param organizationId - The ID of the organization
 * @returns Array of users not yet linked to this organization as staff
 */
export async function getOrganizationUsers(organizationId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  // Get staff members already in this organization
  const existingStaff = await prisma.staff.findMany({
    where: { organizationId },
    select: { userId: true }
  });
  
  const existingUserIds = existingStaff.map(s => s.userId);
  
  // Get users not already in this organization
  const users = await prisma.user.findMany({
    where: {
      id: { notIn: existingUserIds }
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: { name: 'asc' }
  });
  
  return users;
}

/**
 * Get a specific organization by ID
 * 
 * @param organizationId - The ID of the organization to retrieve
 * @returns The organization or null if not found
 */
export async function getOrganization(organizationId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  // Verify the user has access to this organization
  if (session.user.role !== 'ADMIN' && session.user.organizationId !== organizationId) {
    throw new Error("You don't have permission to access this organization");
  }
  
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      organizationType: true,
      description: true,
      logo: true,
      isActive: true
    }
  });
  
  return organization;
}
