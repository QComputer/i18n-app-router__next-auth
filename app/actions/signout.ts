"use server";

import { redirect } from "next/navigation";

export async function signOutAction(locale: string) {
  redirect(`/${locale}/auth/signin`);
}
