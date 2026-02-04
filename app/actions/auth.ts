"use server";

import { signIn } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import { SignupFormSchema, FormState } from '@/lib/definitions'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
  })
  
  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  // 2. Prepare data for insertion into database
  const { username, password, role } = validatedFields.data
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 3. Insert the user into the database or call an Auth Library's API
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      }
    })
    
    // 4. Create user session and redirect
    await signIn('credentials', { username, password })
    
    // This line will only be reached if signIn doesn't redirect
    redirect('/dashboard')
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return {
        message: 'Username already exists. Please choose a different username.',
      }
    }
    return {
      message: 'An error occurred while creating your account.',
    }
  }
}
