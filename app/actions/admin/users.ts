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
  role: 'CLIENT' | 'STAFF' | 'ADMIN' | 'OTHER'
  password?: string
  hierarchy?: 'OWNER' | 'MANAGER' | 'MERCHANT'
}) {
  await requireAdmin()

  const { username, email, name, phone, role, password, hierarchy } = data

  const normalizedUsername = username.trim().toLowerCase()

  // Hash password if provided
  let hashedPassword: string | undefined
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10)
  }

  return prisma.user.create({
    data: {
      username: normalizedUsername,
      email,
      name,
      phone,
      role,
      password: hashedPassword,
    },
  })
}

/**
 * Update user details
 */
export async function updateUser(id: string, data: Partial<{
  username?: string
  email?: string
  name?: string
  phone?: string
  role?: 'CLIENT' | 'STAFF' | 'ADMIN' | 'OTHER'
  password?: string
  locale?: string
  themeMode?: 'LIGHT' | 'DARK' | 'SYSTEM'
  emailVerified?: Date | null
}>) {
  await requireAdmin()

  const updateData: Record<string, any> = { ...data }

  // Hash password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  // Normalize username if updated
  if (updateData.username) {
    updateData.username = updateData.username.trim().toLowerCase()
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete a user (soft delete or hard delete)
 */
export async function deleteUser(id: string, hardDelete = false) {
  await requireAdmin()

  if (hardDelete) {
    return prisma.user.delete({
      where: { id },
    })
  }

  // For now, we don't have a soft delete flag on User, so we'll just delete
  return prisma.user.delete({
    where: { id },
  })
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
