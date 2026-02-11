"use server";

/**
 * Forgot Password Action
 * 
 * Server action that handles password reset requests by:
 * 1. Validating the email or username
 * 2. Generating a secure reset token
 * 3. Sending a password reset email (placeholder)
 * 4. Storing the token in the database
 * 
 * @param prevState - Previous form state for error handling
 * @param formData - Form data containing email or username
 * @returns Form state with success or error message
 */

import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Expiration time for reset token (1 hour)
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

export async function forgotPasswordAction(
  prevState: { message?: string; error?: string },
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const identifier = formData.get("identifier") as string;

  if (!identifier) {
    return { error: "Email or username is required" };
  }

  try {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.toLowerCase().trim() },
        ],
      },
    });

    if (!user) {
      // Return success message to avoid user enumeration
      return { 
        message: "If an account exists with that email or username, you will receive a password reset link" 
      };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Update user with reset token and expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send password reset email (placeholder - implement with your email provider)
    console.log(`Password reset email sent to ${user.email || user.username}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link: /auth/reset-password?token=${resetToken}`);

    return { 
      message: "If an account exists with that email or username, you will receive a password reset link" 
    };
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    return { error: "An error occurred while processing your request" };
  }
}
