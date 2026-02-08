"use server";

import { signIn } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import { SignupFormSchema, FormState } from '@/lib/definitions'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { i18nConfig, type Locale } from '@/i18n-config'

/**
 * Sign Up Action
 * 
 * Server action that handles user registration:
 * 1. Validates form fields using Zod schema
 * 2. Hashes password with bcrypt
 * 3. Creates user in database
 * 4. Signs in the user and redirects to dashboard
 * 
 * @param prevState - Previous form state (for error messages)
 * @param formData - Form data containing username, password, and role
 * @returns Form state with errors or success
 */
export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract locale from formData or use default
  const locale = formData.get('locale') as string || i18nConfig.defaultLocale
  const validLocale = i18nConfig.locales.includes(locale as Locale)
    ? locale
    : i18nConfig.defaultLocale

  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
  })
  
  // If any form fields are invalid, return early with errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  // 2. Prepare data for insertion
  const { username, password, role } = validatedFields.data 
  const normalizedUsername = username.trim().toLowerCase() as string
  
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 3. Insert the user into the database
  try {
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        role: role || 'CLIENT',
      }
    })
    
    console.log(`[Signup] User created successfully: ${user.id}`)
    
    // 4. Sign in the user automatically after registration
    try {
      await signIn('credentials', {
        username: normalizedUsername,
        password: password,
        redirect: false,
      })
      
      // Sign-in successful, redirect to dashboard
      redirect(`/${validLocale}/dashboard`)
    } catch (signInError) {
      // Check if it's a redirect error (which means success)
      if (signInError instanceof Error && 
          signInError.message.includes('NEXT_REDIRECT')) {
        // Redirect was thrown, nothing more to do
        return { success: true }
      }
      
      // Sign-in failed but user was created
      console.error('[Signup] Auto-signin failed after registration:', signInError)
      
      // Redirect to sign-in page with message
      redirect(`/${validLocale}/auth/signin?registered=true`)
    }
  } catch (error: unknown) {
    // Check if it's a redirect error from NextAuth or Next.js
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      (error as { digest?: string }).digest?.includes('NEXT_REDIRECT')
    ) {
      // This is a redirect, re-throw it
      throw error
    }
    
    // Check for Prisma unique constraint error (P2002)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      const prismaError = error as { meta?: { target?: string[] } }
      const target = prismaError.meta?.target || []
      
      if (Array.isArray(target) && target.includes('username')) {
        return {
          message: 'Username already exists. Please choose a different username.',
        }
      }
    }
    
    console.error('[Signup] Error:', error)
    return {
      message: 'An error occurred while creating your account. Please try again.',
    }
  }
}
