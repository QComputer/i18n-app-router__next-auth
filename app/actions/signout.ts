"use server";

import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function signOutAction(locale: string) {
  await signOut({ redirect: false })
  redirect(`/${locale}/auth/signin`)
}
