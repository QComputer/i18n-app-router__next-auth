"use server";

import { signIn } from '@/lib/auth'
import type { FormState } from '@/lib/definitions'

/**
 * Sign In Action
 * 
 * Server action that handles user sign-in with credentials.
 * Uses React useActionState for form state management.
 * 
 * @param prevState - Previous form state (for error messages)
 * @param formData - Form data containing username and password
 * @returns Form state with error message or success
 */
export async function signInAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // Validate input
  if (!username || !password) {
    return {
      errors: {
        username: !username ? ['Username is required'] : undefined,
        password: !password ? ['Password is required'] : undefined,
      }
    }
  }

  try {
    // Attempt to sign in with credentials
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    // Check if sign-in was successful
    // In my customized signIn() returns true on success
    if (!!result) {
      // Sign-in successful, redirect will be handled by the component
      return { success: true }
    }

    // Sign-in failed (shouldn't happen with redirect: false, but handle anyway)
    console.error('[SignIn] Unexpected result:', result)
    return { message: 'An unexpected error occurred' }
  } catch (error) {
    console.error('[SignIn] Error during sign-in:', error)
    
    // Check if it's a redirect error
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Redirect was thrown by NextAuth, which means sign-in was successful
      // The component will handle the redirect
      return { success: true }
    }
    
    // Authentication failed
    return { message: 'Invalid username or password' }
  }
}
