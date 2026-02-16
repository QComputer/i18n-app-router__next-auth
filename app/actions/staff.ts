"use server";

/**
 * Staff Server Actions
 * 
 * Provides server-side operations for fetching staff members grouped by ServiceField.
 * This is used for public organization pages.
 */

import prisma from "@/lib/db/prisma";

/**
 * Type for staff member with user data
 */
export type StaffWithUser = {
  id: string;
  hierarchy: string;
  bio: string | null;
  isActive: boolean;
  isDefault: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
};

/**
 * Type for service field with staff members
 */
export type ServiceFieldWithStaff = {
  id: string;
  name: string;
  staffs: StaffWithUser[];
};

/**
 * Type for organization basic info
 */
export type OrganizationBasic = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

/**
 * Return type for staff by organization
 */
export type StaffByOrganizationResult = {
  organization: OrganizationBasic | null;
  serviceFields: ServiceFieldWithStaff[];
  unassignedStaff: StaffWithUser[];
} | null;

/**
 * Get staff by organization slug grouped by ServiceField
 */
export async function getStaffByOrganizationSlug(slug: string): Promise<StaffByOrganizationResult> {
  // First, get the organization
  const organization = await prisma.organization.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      phone: true,
      email: true,
      address: true,
    },
  });

  if (!organization) {
    return null;
  }

  // Get service fields for this organization
  const serviceFields = await prisma.serviceField.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: { name: "asc" },
    include: {
      staffs: {
        where: { isActive: true },
        orderBy: {
          user: {
            name: "asc",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
    },
  });

  // Get staff members without a ServiceField assignment
  const unassignedStaff = await prisma.staff.findMany({
    where: {
      organizationId: organization.id,
      isActive: true,
      serviceField: {
        none: {},
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  return {
    organization,
    serviceFields: serviceFields as ServiceFieldWithStaff[],
    unassignedStaff: unassignedStaff as StaffWithUser[],
  };
}

/**
 * Get a single staff member by ID with organization info
 */
export async function getStaffMemberById(staffId: string): Promise<{
  staff: StaffWithUser | null;
  organization: OrganizationBasic | null;
} | null> {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          phone: true,
          email: true,
          address: true,
        },
      },
    },
  });

  if (!staff) {
    return null;
  }

  return {
    staff: staff as unknown as StaffWithUser,
    organization: staff.organization as OrganizationBasic,
  };
}

/**
 * Get all active staff for an organization (flat list)
 */
export async function getOrganizationStaff(organizationId: string): Promise<StaffWithUser[]> {
  const staff = await prisma.staff.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  return staff as unknown as StaffWithUser[];
}
