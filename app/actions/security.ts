/**
 * Server Actions for Security Settings
 * 
 * Handles password change and security-related operations.
 */

"use server";

import { auth } from "@/lib/auth";
import { getDictionary } from "@/get-dictionary";
import prisma from "@/lib/db/prisma";
import { hash } from "bcryptjs";

// Helper to get translation
async function getTranslation(locale: string, key: string, fallback: string): Promise<string> {
  try {
    const dictionary = await getDictionary(locale as "en" | "fa" | "ar" | "tr");
    const keys = key.split(".");
    let value: unknown = dictionary;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
      if (value === undefined) return fallback;
    }
    return value as string || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Change password action
 * 
 * @param prevState - Previous form state
 * @param formData - Form data containing currentPassword, newPassword, confirmPassword
 * @returns Action state with success/error message
 */
export async function changePasswordAction(
  prevState: {
    message?: string;
    error?: string;
    success?: boolean;
    errors?: Record<string, string[]>;
  },
  formData: FormData
): Promise<typeof prevState> {
  const locale = (formData.get("locale") as string) || "en";
  
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Get translations
  const t = {
    currentPasswordRequired: await getTranslation(locale, "auth.currentPasswordRequired", "Current password is required"),
    newPasswordRequired: await getTranslation(locale, "auth.newPasswordRequired", "New password is required"),
    passwordMinLength: await getTranslation(locale, "auth.passwordMinLength", "Password must be at least 8 characters"),
    confirmPasswordRequired: await getTranslation(locale, "auth.confirmPasswordRequired", "Please confirm your password"),
    passwordsDoNotMatch: await getTranslation(locale, "auth.passwordsDoNotMatch", "Passwords do not match"),
    validationError: await getTranslation(locale, "auth.validationError", "Please correct the errors below"),
    unauthorized: await getTranslation(locale, "auth.unauthorized", "You must be logged in"),
    userNotFound: await getTranslation(locale, "auth.userNotFound", "User not found"),
    incorrectPassword: await getTranslation(locale, "auth.incorrectPassword", "Current password is incorrect"),
    passwordChanged: await getTranslation(locale, "auth.passwordChanged", "Password changed successfully"),
  };

  // Validate inputs
  const errors: Record<string, string[]> = {};

  if (!currentPassword) {
    errors.currentPassword = [t.currentPasswordRequired];
  }

  if (!newPassword) {
    errors.newPassword = [t.newPasswordRequired];
  } else if (newPassword.length < 8) {
    errors.newPassword = [t.passwordMinLength];
  }

  if (!confirmPassword) {
    errors.confirmPassword = [t.confirmPasswordRequired];
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = [t.passwordsDoNotMatch];
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: t.validationError,
      errors,
    };
  }

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.unauthorized };
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  if (!user) {
    return { error: t.userNotFound };
  }

  // Verify current password (if user has a password)
  if (user.password) {
    const { compare } = await import("bcryptjs");
    const isValid = await compare(currentPassword, user.password);
    
    if (!isValid) {
      return {
        error: t.incorrectPassword,
        errors: { currentPassword: [t.incorrectPassword] },
      };
    }
  }

  // Hash and update new password
  const hashedPassword = await hash(newPassword, 12);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return {
    success: true,
    message: t.passwordChanged,
  };
}

/**
 * Get user's security settings
 * 
 * @returns User's security-related data
 */
export async function getSecuritySettings() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      createdAt: true,
      password: true,
    },
  });
}
