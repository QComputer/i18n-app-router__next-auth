/**
 * User-Staff Sync Handler
 * 
 * This module handles automatic synchronization between User.role and Staff.hierarchy.
 * It listens to user events and updates staff records accordingly.
 * 
 * Rules:
 * - ADMIN and CLIENT users: staff record should be null (staff deleted)
 * - OWNER, MANAGER, STAFF, MERCHANT users: staff.hierarchy should match user.role
 */

import { PrismaClient } from "@/lib/generated/prisma/client"
import { userEvents } from "@/lib/events/emitter"
import { UserEvents, UserEvent, UserRoleChangedEvent, UserCreatedEvent, UserDeletedEvent } from "@/lib/events/types"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})

/**
 * Map user roles to hierarchy values
 * Only non-ADMIN and non-CLIENT roles have hierarchy values
 */
function roleToHierarchy(role: string): string | null {
  const roleHierarchyMap: Record<string, string> = {
    OWNER: "OWNER",
    MANAGER: "MANAGER",
    MERCHANT: "MERCHANT",
    STAFF: "MERCHANT",
  }
  return roleHierarchyMap[role] || null
}

/**
 * Check if a role is a staff role (not ADMIN or CLIENT)
 */
function isStaffRole(role: string): boolean {
  return ["STAFF", "OWNER", "MANAGER", "MERCHANT"].includes(role)
}

/**
 * Get the default organization for a new staff member
 * Falls back to the first active organization
 */
async function getDefaultOrganizationId(): Promise<string | null> {
  const defaultStaff = await prisma.staff.findFirst({
    where: { isDefault: true },
    select: { organizationId: true },
  })

  if (defaultStaff) {
    return defaultStaff.organizationId
  }

  // Fallback to first organization
  const firstOrg = await prisma.organization.findFirst({
    where: { isActive: true },
    select: { id: true },
  })

  return firstOrg?.id || null
}

/**
 * Handle user role change event
 * Syncs staff.hierarchy with user.role
 */
async function handleRoleChanged(event: UserEvent): Promise<void> {
  const e = event as UserRoleChangedEvent
  const { userId, oldRole, newRole } = e

  console.log(`[User-Staff Sync] Role changed for user ${userId}: ${oldRole} -> ${newRole}`)

  // Case 1: New role is ADMIN or CLIENT - remove staff record
  if (!isStaffRole(newRole)) {
    const existingStaff = await prisma.staff.findUnique({
      where: { userId },
    })

    if (existingStaff) {
      await prisma.staff.delete({
        where: { id: existingStaff.id },
      })
      console.log(`[User-Staff Sync] Removed staff record for user ${userId} (now ${newRole})`)
    }
    return
  }

  // Case 2: New role is a staff role - create or update staff record
  const hierarchy = roleToHierarchy(newRole)
  if (!hierarchy) {
    console.error(`[User-Staff Sync] Unknown hierarchy for role: ${newRole}`)
    return
  }

  const organizationId = await getDefaultOrganizationId()
  if (!organizationId) {
    console.error(`[User-Staff Sync] No organization found for user ${userId}`)
    return
  }

  await prisma.staff.upsert({
    where: { userId },
    update: {
      hierarchy,
      organizationId,
      isActive: true,
    },
    create: {
      userId,
      hierarchy,
      organizationId,
      isActive: true,
      isDefault: newRole === "OWNER",
    },
  })

  console.log(`[User-Staff Sync] Created/updated staff record for user ${userId} with hierarchy ${hierarchy}`)

  // Revalidate admin pages
  revalidatePath("/en/admin/users", "page")
  revalidatePath("/fa/admin/users", "page")
}

/**
 * Handle user created event
 * If new user is staff role, create staff record
 */
async function handleUserCreated(event: UserEvent): Promise<void> {
  const e = event as UserCreatedEvent
  const { userId, role } = e

  if (!isStaffRole(role)) {
    return
  }

  const hierarchy = roleToHierarchy(role)
  if (!hierarchy) return

  const organizationId = await getDefaultOrganizationId()
  if (!organizationId) return

  await prisma.staff.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      hierarchy,
      organizationId,
      isActive: true,
      isDefault: role === "OWNER",
    },
  })

  console.log(`[User-Staff Sync] Created staff record for new user ${userId}`)
}

/**
 * Handle user deleted event
 * Remove associated staff record
 */
async function handleUserDeleted(event: UserEvent): Promise<void> {
  const e = event as UserDeletedEvent
  const { userId } = e

  const existingStaff = await prisma.staff.findUnique({
    where: { userId },
  })

  if (existingStaff) {
    await prisma.staff.delete({
      where: { id: existingStaff.id },
    })
    console.log(`[User-Staff Sync] Removed staff record for deleted user ${userId}`)
  }
}

/**
 * Initialize the User-Staff Sync Handler
 * Sets up event listeners for user events
 */
export function initializeUserStaffSync(): () => void {
  console.log("[User-Staff Sync] Initializing sync handler...")

  const unsubscribers: (() => void)[] = []

  // Listen for role changes
  unsubscribers.push(
    userEvents.on(UserEvents.USER_ROLE_CHANGED, handleRoleChanged)
  )

  // Listen for user creation
  unsubscribers.push(
    userEvents.on(UserEvents.USER_CREATED, handleUserCreated)
  )

  // Listen for user deletion
  unsubscribers.push(
    userEvents.on(UserEvents.USER_DELETED, handleUserDeleted)
  )

  console.log("[User-Staff Sync] Sync handler initialized")

  // Return cleanup function
  return () => {
    console.log("[User-Staff Sync] Cleaning up sync handler...")
    unsubscribers.forEach((unsub) => unsub())
    console.log("[User-Staff Sync] Sync handler cleaned up")
  }
}

/**
 * Emit a user role changed event
 */
export async function emitRoleChanged(
  userId: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  const event: UserRoleChangedEvent = {
    type: UserEvents.USER_ROLE_CHANGED,
    userId,
    oldRole,
    newRole,
    timestamp: new Date(),
  }

  await userEvents.emit(event)
}

/**
 * Emit a user created event
 */
export async function emitUserCreated(userId: string, role: string): Promise<void> {
  const event: UserCreatedEvent = {
    type: UserEvents.USER_CREATED,
    userId,
    role,
    timestamp: new Date(),
  }

  await userEvents.emit(event)
}

/**
 * Emit a user deleted event
 */
export async function emitUserDeleted(userId: string, role: string): Promise<void> {
  const event: UserDeletedEvent = {
    type: UserEvents.USER_DELETED,
    userId,
    role,
    timestamp: new Date(),
  }

  await userEvents.emit(event)
}

/**
 * Manually sync a user's staff record
 * Useful for existing data migration
 */
export async function syncUserStaff(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staff: true },
  })

  if (!user) {
    console.error(`[User-Staff Sync] User ${userId} not found`)
    return
  }

  const { role } = user

  if (!isStaffRole(role)) {
    // Remove staff record if exists
    if (user.staff) {
      await prisma.staff.delete({
        where: { id: user.staff.id },
      })
      console.log(`[User-Staff Sync] Removed staff record for user ${userId}`)
    }
    return
  }

  const hierarchy = roleToHierarchy(role)
  if (!hierarchy) return

  const organizationId = await getDefaultOrganizationId()
  if (!organizationId) {
    console.error(`[User-Staff Sync] No organization found for user ${userId}`)
    return
  }

  await prisma.staff.upsert({
    where: { userId },
    update: { hierarchy, organizationId },
    create: {
      userId,
      hierarchy,
      organizationId,
      isActive: true,
      isDefault: role === "OWNER",
    },
  })

  console.log(`[User-Staff Sync] Manually synced staff for user ${userId}`)
}

/**
 * Sync all users' staff records
 * Run this for initial data migration
 */
export async function syncAllUsersStaffByPrisma(prisma: PrismaClient): Promise<void> {
  console.log("[User-Staff Sync] Starting full sync of all users...")

  const users = await prisma.user.findMany({
    include: { staff: true },
  })

  const organizationId = await getDefaultOrganizationId()
  if (!organizationId) {
    console.error("[User-Staff Sync] No organization found, aborting sync")
    return
  }

  let synced = 0
  let removed = 0

  for (const user of users) {
    if (!isStaffRole(user.role)) { // when the user is not a staff
      if (user.staff) {
        await prisma.staff.delete({
          where: { id: user.staff.id },
        })
        removed++
      }
    } else {
      const hierarchy = roleToHierarchy(user.role)
      if (hierarchy) {
        await prisma.staff.upsert({
          where: { userId: user.id },
          update: { hierarchy, organizationId },
          create: {
            userId: user.id,
            hierarchy,
            organizationId,
            isActive: true,
            isDefault: user.role === "OWNER",
          },
        })
        synced++
      }
    }
  }

  console.log(`[User-Staff Sync] Full sync complete: ${synced} synced, ${removed} removed`)

  // Revalidate all admin user pages
  revalidatePath("/en/admin/users", "page")
  revalidatePath("/fa/admin/users", "page")
  revalidatePath("/ar/admin/users", "page")
  revalidatePath("/tr/admin/users", "page")
}
export async function syncAllUsersStaff(): Promise<void> {
  syncAllUsersStaffByPrisma(prisma)
}
