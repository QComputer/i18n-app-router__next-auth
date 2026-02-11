/**
 * Token Validation API Route
 * 
 * Validates password reset tokens
 * 
 * Route: /api/auth/validate-token
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * Validate reset token action
 * This is a server-side function that validates password reset tokens
 */
async function validateResetTokenAction(token: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  if (!token) {
    return { isValid: false, error: "Token is required" };
  }

  try {
    // Find the user with this reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return { isValid: false, error: "Invalid reset token" };
    }

    // Check if token has expired
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return { isValid: false, error: "Reset token has expired" };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Token validation error:", error);
    return { isValid: false, error: "Failed to validate token" };
  }
}

/**
 * GET handler for token validation
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { isValid: false, error: "Token is required" },
      { status: 400 }
    );
  }

  const result = await validateResetTokenAction(token);

  return NextResponse.json(result);
}
