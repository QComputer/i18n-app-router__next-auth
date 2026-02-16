"use server";

/**
 * Profile Image Server Actions
 * 
 * Handles profile image upload and updates for users and staff
 */

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Update user profile image
 */
export async function updateProfileImage(imageUrl: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Update the user's image
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  // Revalidate relevant paths
  revalidatePath("/[lang]/dashboard");
  revalidatePath("/[lang]/settings/profile");
  revalidatePath("/[lang]/settings/organization/staff");
  revalidatePath("/o/[slug]/staff");

  return updatedUser;
}

/**
 * Update staff member's user profile image
 */
export async function updateStaffProfileImage(staffId: string, imageUrl: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the staff member
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { user: true },
  });

  if (!staff) {
    throw new Error("Staff member not found");
  }

  // Check authorization - user must be admin, owner, or manager of the organization
  // or updating their own profile
  const isOwnProfile = staff.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isOrgAdmin = session.user.organizationId === staff.organizationId && 
    (session.user.role === "OWNER" || session.user.role === "MANAGER");

  if (!isOwnProfile && !isAdmin && !isOrgAdmin) {
    throw new Error("Unauthorized to update this profile");
  }

  // Update the user's image
  const updatedUser = await prisma.user.update({
    where: { id: staff.userId },
    data: { image: imageUrl },
  });

  // Revalidate relevant paths
  revalidatePath("/[lang]/settings/organization/staff");
  revalidatePath("/[lang]/settings/organization/staff/[id]");
  revalidatePath("/o/[slug]/staff");

  return updatedUser;
}
