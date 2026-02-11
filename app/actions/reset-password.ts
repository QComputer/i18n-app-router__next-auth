"use server";

/**
 * Reset Password Action
 * 
 * Server action that handles password reset by:
 * 1. Validating the reset token
 * 2. Checking token expiration
 * 3. Hashing and updating the new password
 * 4. Clearing the reset token
 * 
 * @param prevState - Previous form state for error handling
 * @param formData - Form data containing new password and confirmation
 * @returns Form state with success or error message
 */

import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

/**
 * Type definition for the form state returned by server actions
 */
interface ActionState {
  message?: string;
  error?: string;
  success?: boolean;
}

/**
 * Validate that a password meets security requirements
 * 
 * @param password - The password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
function validatePassword(password: string): { isValid: boolean; error?: string } {
  // Minimum 8 characters
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  // At least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one letter" };
  }
  
  // At least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }
  
  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" };
  }
  
  return { isValid: true };
}

/**
 * Reset password action - validates token and updates password
 * 
 * @param prevState - Previous form state
 * @param formData - Form data with token, password, and confirmPassword
 * @returns ActionState with success or error message
 */
export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate required fields
  if (!token) {
    return { error: "Invalid reset token" };
  }

  if (!password || !confirmPassword) {
    return { error: "Password and confirmation are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.error || "Password does not meet requirements" };
  }

  try {
    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return { error: "Invalid or expired reset token. Please request a new password reset." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    console.log(`[ResetPassword] Password reset successfully for user: ${user.id}`);

    return { 
      success: true,
      message: "Your password has been reset successfully. Redirecting to sign in..." 
    };
  } catch (error) {
    console.error("[ResetPassword] Error:", error);
    return { error: "An error occurred while resetting your password" };
  }
}

/**
 * Validate reset token action
 * 
 * This action is used to validate a reset token before showing the reset form
 * 
 * @param token - The reset token to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export async function validateResetTokenAction(token: string): Promise<{ isValid: boolean; error?: string }> {
  if (!token) {
    return { isValid: false, error: "Invalid reset token" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { isValid: false, error: "Invalid or expired reset token" };
    }

    return { isValid: true };
  } catch (error) {
    console.error("[ValidateResetToken] Error:", error);
    return { isValid: false, error: "An error occurred while validating the token" };
  }
}
