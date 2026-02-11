"use server";

/**
 * User Profile Actions
 * 
 * Server actions for managing user profile settings.
 * Provides functionality to update user profile information.
 * 
 * @module app/actions/profile
 */

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Type definition for the form state returned by server actions
 */
interface ActionState {
  message?: string;
  error?: string;
  success?: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
  };
}

/**
 * Validate email format
 * 
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * Supports various international formats
 * 
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone is valid
 */
function isValidPhone(phone: string): boolean {
  // Basic validation - allows international formats
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Update user profile action
 * 
 * Updates the authenticated user's profile information.
 * Validates input and ensures email uniqueness if changed.
 * 
 * @param prevState - Previous form state
 * @param formData - Form data containing profile fields
 * @returns ActionState with success or error message
 */
export async function updateProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Get current session
  const session = await auth();
  
  // Check authentication
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;
  
  // Extract form data
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const locale = formData.get("locale") as string || "fa";

  // Validate required fields
  if (!name || name.trim().length < 2) {
    return {
      error: "Name must be at least 2 characters long",
      errors: { name: ["Name must be at least 2 characters long"] },
    };
  }

  // Validate email if provided
  if (email && !isValidEmail(email)) {
    return {
      error: "Please enter a valid email address",
      errors: { email: ["Please enter a valid email address"] },
    };
  }

  // Validate phone if provided
  if (phone && !isValidPhone(phone)) {
    return {
      error: "Please enter a valid phone number",
      errors: { phone: ["Please enter a valid phone number"] },
    };
  }

  try {
    // Check if email is being changed and if it's already in use
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (email && currentUser && email !== currentUser.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          id: { not: userId },
        },
      });

      if (existingUser) {
        return {
          error: "This email is already in use by another account",
          errors: { email: ["This email is already in use"] },
        };
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || null,
        email: email?.toLowerCase().trim() || null,
        phone: phone?.trim() || null,
        locale: locale,
      },
    });

    console.log(`[Profile] User profile updated successfully: ${userId}`);

    // Revalidate relevant pages
    revalidatePath("/dashboard");
    revalidatePath("/settings/profile");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("[Profile] Error updating profile:", error);
    return { error: "An error occurred while updating your profile" };
  }
}

/**
 * Upload user avatar action
 * 
 * Handles avatar image upload and update.
 * In a real implementation, this would upload to cloud storage.
 * 
 * @param userId - User ID
 * @param avatarUrl - URL of the uploaded avatar
 * @returns ActionState with success or error message
 */
export async function updateAvatarAction(
  userId: string,
  avatarUrl: string
): Promise<ActionState> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    console.log(`[Profile] Avatar updated for user: ${userId}`);
    
    return {
      success: true,
      message: "Avatar updated successfully",
    };
  } catch (error) {
    console.error("[Profile] Error updating avatar:", error);
    return { error: "An error occurred while updating your avatar" };
  }
}

/**
 * Delete user avatar action
 * 
 * Removes the user's avatar image.
 * 
 * @param userId - User ID
 * @returns ActionState with success or error message
 */
export async function deleteAvatarAction(userId: string): Promise<ActionState> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    console.log(`[Profile] Avatar deleted for user: ${userId}`);
    
    return {
      success: true,
      message: "Avatar deleted successfully",
    };
  } catch (error) {
    console.error("[Profile] Error deleting avatar:", error);
    return { error: "An error occurred while deleting your avatar" };
  }
}
