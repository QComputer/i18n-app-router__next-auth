/**
 * Staff Library
 * 
 * Provides CRUD operations for staff members.
 * 
 * Prisma Schema Reference:
 * model Staff {
 *   id        String  @id @default(cuid())
 *   name      String
 *   bio       String?
 *   image     String?
 *   isActive  Boolean @default(true)
 *   isDefault Boolean @default(false)
 *   organizationId String
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 */

import prisma from "@/lib/db/prisma"

/**
 * Staff type definition - matches Prisma Staff model
 */
export type Staff = {
  id: string
  bio: string | null
  isActive: boolean
  isDefault: boolean

  userId?: string
  organizationId?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Staff with user relation type
 */
export type StaffWithUser = Staff & {
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  } | null
}

/**
 * Create a new staff member
 * 
 * @param data - Staff creation data
 * @returns Created staff member
 */
export async function createStaff(data: {
  userId:string
  bio?: string | null
  image?: string
  organizationId: string
}): Promise<Staff> {
  return prisma.staff.create({
    data: {
      userId: data.userId,
      organizationId: data.organizationId,
      bio: data.bio || null,
    },
  })
}

/**
 * Get a staff member by ID
 * 
 * @param id - Staff ID
 * @returns Staff member or null if not found
 */
export async function getStaffById(id: string): Promise<Staff | null> {
  return prisma.staff.findUnique({
    where: { id },
  })
}

/**
 * Get a staff's ID and staff's Organization ID by User ID
 * 
 * @param userId - User ID
 * @returns staffId,organizationId or null if not found
 */
export async function getStaffIDAndOrganizationIdByUserId(userId: string): Promise<{ staffId: string; organizationId: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staff: true },
  })
  
  if (!user?.staff) {
    return null
  }
  
  return {
    staffId: user.staff.id,
    organizationId: user.staff.organizationId,
  }
}

/**
 * Get all staff members for an organization
 * 
 * @param organizationId - Organization ID
 * @param options - Query options (includeInactive, limit, offset)
 * @returns Array of staff members
 */
export async function getStaffByOrganization(
  organizationId: string,
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<Staff[]> {
  const where: Record<string, unknown> = {
    organizationId,
  }

  if (!options?.includeInactive) {
    where.isActive = true
  }

  return prisma.staff.findMany({
    where,
    take: options?.limit,
    skip: options?.offset,
  })
}

/**
 * Update a staff member
 * 
 * @param id - Staff ID
 * @param data - Update data
 * @returns Updated staff member
 */
export async function updateStaff(
  id: string,
  data: {
    bio?: string
    isActive?: boolean
    isDefault?: boolean
  }
): Promise<Staff> {
  return prisma.staff.update({
    where: { id },
    data,
  })
}

/**
 * Delete a staff member (soft delete by setting isActive to false)
 * 
 * @param id - Staff ID
 * @returns Updated staff member
 */
export async function deleteStaff(id: string): Promise<Staff> {
  return prisma.staff.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Hard delete a staff member (permanent)
 * Use with caution - this permanently removes the staff member
 * 
 * @param id - Staff ID
 */
export async function hardDeleteStaff(id: string): Promise<void> {
  await prisma.staff.delete({
    where: { id },
  })
}

/**
 * Count staff members for an organization
 * 
 * @param organizationId - Organization ID
 * @param includeInactive - Include inactive staff in count
 * @returns Count of staff members
 */
export async function countStaff(
  organizationId: string,
  includeInactive = false
): Promise<number> {
  const where: Record<string, unknown> = {
    organizationId,
  }

  if (!includeInactive) {
    where.isActive = true
  }

  return prisma.staff.count({ where })
}

/**
 * Get a staff member by ID with user relation
 * 
 * @param id - Staff ID
 * @returns Staff member with user or null if not found
 */
export async function getStaffByIdWithUser(id: string): Promise<StaffWithUser | null> {
  return prisma.staff.findUnique({
    where: { id },
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
  })
}

/**
 * Get all staff members for an organization with user relation
 * 
 * @param organizationId - Organization ID
 * @param options - Query options
 * @returns Array of staff members with user data
 */
export async function getStaffByOrganizationWithUser(
  organizationId: string,
  options?: {
    includeInactive?: boolean
    limit?: number
    offset?: number
  }
): Promise<StaffWithUser[]> {
  const where: Record<string, unknown> = {
    organizationId,
  }

  if (!options?.includeInactive) {
    where.isActive = true
  }

  return prisma.staff.findMany({
    where,
    take: options?.limit,
    skip: options?.offset,
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
  })
}

/**
 * Search staff by name (through user relation)
 * 
 * @param organizationId - Organization ID
 * @param query - Search query
 * @returns Array of matching staff members
 */
export async function searchStaff(
  organizationId: string,
  //query: string
): Promise<Staff[]> {
  return prisma.staff.findMany({
    where: {
      organizationId,
      isActive: true
    }
  })
}
