/**
 * Form Definitions and Validation Schemas
 * 
 * This module defines form validation schemas and types
 * for the authentication flow.
 */

import * as z from 'zod'

/**
 * Sign Up Form Validation Schema
 * 
 * Validates username, password, and role fields with:
 * - Username: minimum 2 characters
 * - Password: minimum 8 chars, at least 1 letter, 1 number, 1 special character
 * - Role: defaults to CLIENT
 */
export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { error: 'Name must be at least 2 characters long.' })
    .trim(),
  password: z
    .string()
    .min(8, { error: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Contain at least one special character.',
    })
    .trim(),
  role: z
    .string()
    .default('CLIENT'),
})

/**
 * Form State Type
 * 
 * Represents the state of a form action, including:
 * - errors: Field-specific validation errors
 * - message: General error or success messages
 * - success: Flag indicating successful form submission
 */
export type FormState =
  | {
      errors?: {
        username?: string[]
        password?: string[]
        role?: string[]
      }
      message?: string
      success?: boolean
    }
  | undefined

/**
 * Sign In Form Validation Schema
 * 
 * Validates username and password fields
 */
export const SigninFormSchema = z.object({
  username: z
    .string()
    .min(1, { error: 'Username is required' })
    .trim(),
  password: z
    .string()
    .min(1, { error: 'Password is required' }),
})

/**
 * Type for sign-in form data
 */
export type SigninFormData = z.infer<typeof SigninFormSchema>
