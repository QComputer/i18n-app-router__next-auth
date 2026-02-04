"use server";

import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function signInAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  try {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { error: 'Invalid username or password' }
    }

    redirect('/dashboard')
  } catch (error) {
    return { error: 'Something went wrong' }
  }
}
