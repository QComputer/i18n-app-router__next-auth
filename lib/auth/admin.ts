
/**
 * Admin Role Validation Middleware
 * 
 * Provides utilities for validating and requiring admin role access
 * for protected routes and operations.
 */

import { auth } from './index'
import { redirect } from 'next/navigation'

/**
 * Require admin role for access to a route or function
 * 
 * Redirects to signin page if user is not authenticated or not an admin
 * 
 * @returns Authenticated admin user session
 */
export async function requireAdmin() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }
  
  return session.user
}

/**
 * Check if a user has admin role
 * 
 * @param role - User's role to check
 * @returns True if user has admin role
 */
export function isAdmin(role: string): boolean {
  return role === 'ADMIN'
}

/**
 * Check if a user has admin role
 * 
 * @param role - User's role to check
 * @returns True if user has admin role
 */
export function isOrganizationAdmin(role: string | null | undefined): boolean {
  return (!!role && (role === 'OWNER' || role === 'MANAGER'))
}

/**
 * Check if a user has staff or admin role
 * 
 * @param role - User's role to check
 * @returns True if user has staff or admin role
 */
export function isStaffOrAdmin(role: string): boolean {
  return (role === 'STAFF' || role === 'ADMIN' || role === 'OWNER' || role === 'MANAGER' || role === 'MERCHANT' )
}

/**
 * Require staff or admin role for access to a route or function
 * 
 * Redirects to signin page if user is not authenticated or not a staff/admin
 * 
 * @returns Authenticated staff/admin user session
 */
export async function requireStaff() {
  const session = await auth()
  
  if (!session?.user || !['STAFF', 'ADMIN', 'OWNER', 'MERCHANT', 'MANAGER'].includes(session.user.role)) {
    redirect('/auth/signin')
  }
  
  return session.user
}

/**
 * Require organization-owner/manager or admin role for access to a route or function
 * 
 * Redirects to signin page if user is not authenticated or not a staff/admin
 * 
 * @returns Authenticated staff/admin user session
 */
export async function requireOrganizationAdmin() {
  const session = await auth()
  
  if (!session?.user || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
    redirect('/auth/signin')
  }
  
  return session.user
}
