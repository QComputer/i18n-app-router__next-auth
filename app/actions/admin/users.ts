"use server";

/**
 * Admin User Management Server Actions
 * 
 * Provides server-side CRUD operations for managing users with admin privileges.
 * These actions are only accessible to authenticated admin users.
 */

import prisma from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { requireAdmin } from "@/lib/auth/admin"
import { emitRoleChanged, emitUserCreated, emitUserDeleted } from "@/lib/sync/user-staff-sync"

/**
 * Get all users with optional filtering and pagination
 */
export async function getUsers(params: {
  role?: string
  page?: number
  limit?: number
  search?: string
}) {
  await requireAdmin()

  const { role, page = 1, limit = 50, search = "" } = params

  const where: Record<string, any> = {}

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        staff: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string) {
  await requireAdmin()

  return prisma.user.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          organization: true,
        },
      },
      appointments: {
        include: {
          service: true,
        },
      },
    },
  })
}

/**
 * Create a new user with optional password
 */
export async function createUser(data: {
  username: string
  email?: string
  name?: string
  phone?: string
  role: 'CLIENT' | 'STAFF' | 'ADMIN' | 'OWNER' | 'MANAGER' | 'MERCHANT' | 'OTHER'
  password?: string
  hierarchy?: 'OWNER' | 'MANAGER' | 'MERCHANT'
}) {
  await requireAdmin()

  const { username, email, name, phone, role, password } = data

  const normalizedUsername = username.trim().toLowerCase()

  // Hash password if provided
  let hashedPassword: string | undefined
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10)
  }

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email,
      name,
      phone,
      role,
      password: hashedPassword,
    },
  })

  // Emit user created event for staff sync
  await emitUserCreated(user.id, user.role)

  return user
}

/**
 * Update user details
 */
export async function updateUser(id: string, data: Partial<{
  username?: string
  email?: string
  name?: string
  phone?: string
  role?: 'CLIENT' | 'STAFF' | 'ADMIN' | 'OWNER' | 'MANAGER' | 'MERCHANT' | 'OTHER'
  password?: string
  locale?: string
  themeMode?: 'LIGHT' | 'DARK' | 'SYSTEM'
  emailVerified?: Date | null
}>) {
  await requireAdmin()

  const updateData: Record<string, any> = { ...data }

  // Get current user to track role changes
  const currentUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })

  if (!currentUser) {
    throw new Error("User not found")
  }

  // Hash password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  // Normalize username if updated
  if (updateData.username) {
    updateData.username = updateData.username.trim().toLowerCase()
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  // Emit role changed event if role was updated
  if (data.role && data.role !== currentUser.role) {
    await emitRoleChanged(id, currentUser.role, data.role)
  }

  return user
}

/**
 * Delete a user (hard delete or hard delete)
 */
export async function deleteUser(id: string, hardDelete = false) {
  await requireAdmin()

  // Get user before deletion for event
  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (hardDelete) {
    await prisma.user.delete({
      where: { id },
    })
  } else {
    // For now, we don't have a soft delete flag on User, so we'll just delete
    await prisma.user.delete({
      where: { id },
    })
  }

  // Emit user deleted event for staff sync cleanup
  await emitUserDeleted(id, user.role)
}

/**
 * Deactivate/activate a user
 */
export async function toggleUserStatus(id: string, isActive: boolean) {
  await requireAdmin()

  // Note: We don't have an isActive field on User model currently
  // This would need to be added if we want to support soft deletes
  throw new Error("User status toggling not implemented")
}

/**
 * Convert a user to staff role with specified hierarchy
 */
export async function convertToStaff(id: string, hierarchy: 'OWNER' | 'MANAGER' | 'MERCHANT') {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const newRole = hierarchy === 'OWNER' ? 'OWNER' : hierarchy === 'MANAGER' ? 'MANAGER' : 'MERCHANT'

  await prisma.user.update({
    where: { id },
    data: { role: newRole },
  })

  // Emit role changed event
  await emitRoleChanged(id, user.role, newRole)
}

/**
 * Remove staff status from a user (convert to CLIENT)
 */
export async function removeStaffStatus(id: string) {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  await prisma.user.update({
    where: { id },
    data: { role: 'CLIENT' },
  })

  // Emit role changed event
  await emitRoleChanged(id, user.role, 'CLIENT')
}
