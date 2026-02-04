

import { signIn } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import { SignupFormSchema, FormState } from '@/lib/definitions'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/dist/server/api-utils'
 
export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  /**
 * To prevent unnecessary calls to your authentication provider's API or database,
 * you can return early in the Server Action if any form fields do not match the defined schema.
 */
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })
 
  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
 
  // 2. Prepare data for insertion into database
  const { username, password } = validatedFields.data
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 3. Insert the user into the database or call an Auth Library's API
  const user = await prisma.user.create({
    data: {
        username,
        password: hashedPassword,
    }
  })
 
  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }
 
  
  // 4. Create user session
  signIn('credentials', {username , password})
  // 5. Redirect user
}