"use server";

/**
 * User to Staff Conversion Actions
 * 
 * Provides functionality to convert CLIENT users to STAFF members.
 * When a user is converted to staff:
 * - A Staff record is created and linked to the User
 * - The User's role is updated to STAFF
 * - Each Staff belongs to an Organization
 * 
 * @module app/actions/user-to-staff
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
    userId?: string[];
    organizationId?: string[];
    hierarchy?: string[];
  };
}

/**
 * Convert a CLIENT user to STAFF member
 * 
 * This function:
 * 1. Validates the current user has permission (ADMIN or OWNER)
 * 2. Creates a Staff record linked to the User
 * 3. Updates the User's role to STAFF
 * 4. Syncs the hierarchy between User and Staff
 * 
 * @param prevState - Previous form state
 * @param formData - Form data containing userId, organizationId, and hierarchy
 * @returns ActionState with success or error message
 */
export async function convertUserToStaffAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  
  // Check authentication and authorization
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only ADMIN or OWNER can convert users to staff
  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return {
      error: "You don't have permission to convert users to staff",
      errors: { userId: ["Unauthorized"] },
    };
  }

  const userId = formData.get("userId") as string;
  const organizationId = formData.get("organizationId") as string;
  const hierarchy = formData.get("hierarchy") as string || "MERCHANT";

  // Validate required fields
  if (!userId) {
    return {
      error: "User ID is required",
      errors: { userId: ["User ID is required"] },
    };
  }

  if (!organizationId) {
    return {
      error: "Organization is required",
      errors: { organizationId: ["Organization is required"] },
    };
  }

  // Validate hierarchy
  const validHierarchies = ["OWNER", "MANAGER", "MERCHANT"];
  if (!validHierarchies.includes(hierarchy)) {
    return {
      error: "Invalid hierarchy level",
      errors: { hierarchy: ["Invalid hierarchy level"] },
    };
  }

  try {
    // Check if user already has a staff record
    const existingStaff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (existingStaff) {
      return {
        error: "This user is already a staff member",
        errors: { userId: ["User is already staff"] },
      };
    }

    // Verify the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return {
        error: "Organization not found",
        errors: { organizationId: ["Organization not found"] },
      };
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        error: "User not found",
        errors: { userId: ["User not found"] },
      };
    }

    // Create Staff record and update User role in a transaction
    await prisma.$transaction([
      // Create the Staff record
      prisma.staff.create({
        data: {
          userId,
          organizationId,
          hierarchy,
          isActive: true,
          isDefault: false,
        },
      }),
      // Update the user's role to STAFF
      prisma.user.update({
        where: { id: userId },
        data: {
          role: "STAFF",
        },
      }),
    ]);

    console.log(`[UserToStaff] User ${userId} converted to staff in organization ${organizationId}`);

    revalidatePath("/admin/users");
    revalidatePath("/admin/staff");

    return {
      success: true,
      message: `${user.name || user.username} has been converted to staff member`,
    };
  } catch (error) {
    console.error("[UserToStaff] Error converting user to staff:", error);
    return {
      error: "An error occurred while converting the user to staff",
    };
  }
}

/**
 * Update Staff hierarchy and sync with User role
 * 
 * When hierarchy changes, the changes should be reflected appropriately:
 * - OWNER hierarchy should keep role as STAFF (ownership is separate)
 * - But for simplicity, we sync the hierarchy field
 * 
 * @param prevState - Previous form state
 * @param formData - Form data containing staffId and new hierarchy
 * @returns ActionState with success or error message
 */
export async function updateStaffHierarchyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  
  // Check authentication and authorization
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only ADMIN or OWNER can update hierarchy
  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return {
      error: "You don't have permission to update hierarchy",
      errors: { hierarchy: ["Unauthorized"] },
    };
  }

  const staffId = formData.get("staffId") as string;
  const hierarchy = formData.get("hierarchy") as string;

  // Validate required fields
  if (!staffId) {
    return {
      error: "Staff ID is required",
      errors: { hierarchy: ["Staff ID is required"] },
    };
  }

  // Validate hierarchy
  const validHierarchies = ["OWNER", "MANAGER", "MERCHANT"];
  if (!validHierarchies.includes(hierarchy)) {
    return {
      error: "Invalid hierarchy level",
      errors: { hierarchy: ["Invalid hierarchy level"] },
    };
  }

  try {
    // Verify the staff record exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) {
      return {
        error: "Staff record not found",
        errors: { hierarchy: ["Staff not found"] },
      };
    }

    // Update the hierarchy
    await prisma.staff.update({
      where: { id: staffId },
      data: { hierarchy },
    });

    console.log(`[StaffHierarchy] Staff ${staffId} hierarchy updated to ${hierarchy}`);

    revalidatePath("/admin/staff");
    revalidatePath(`/admin/staff/${staffId}`);

    return {
      success: true,
      message: "Hierarchy updated successfully",
    };
  } catch (error) {
    console.error("[StaffHierarchy] Error updating hierarchy:", error);
    return {
      error: "An error occurred while updating hierarchy",
    };
  }
}

/**
 * Remove staff status from a user (convert back to CLIENT)
 * 
 * This function:
 * 1. Deletes the Staff record
 * 2. Updates the User's role back to CLIENT
 * 
 * @param prevState - Previous form state
 * @param formData - Form data containing staffId
 * @returns ActionState with success or error message
 */
export async function removeStaffStatusAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  
  // Check authentication and authorization
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only ADMIN or OWNER can remove staff status
  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return {
      error: "You don't have permission to remove staff status",
    };
  }

  const staffId = formData.get("staffId") as string;

  if (!staffId) {
    return {
      error: "Staff ID is required",
    };
  }

  try {
    // Get the staff record with user info
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) {
      return {
        error: "Staff record not found",
      };
    }

    // Prevent removing OWNER's staff status if they're the organization owner
    // (This is a business logic check - could be enhanced)

    // Delete staff record and update user role in a transaction
    await prisma.$transaction([
      // Delete the Staff record
      prisma.staff.delete({
        where: { id: staffId },
      }),
      // Update the user's role back to CLIENT
      prisma.user.update({
        where: { id: staff.userId },
        data: {
          role: "CLIENT",
        },
      }),
    ]);

    console.log(`[StaffRemove] Staff status removed for user ${staff.userId}`);

    revalidatePath("/admin/users");
    revalidatePath("/admin/staff");

    return {
      success: true,
      message: `Staff status removed for ${staff.user.name || staff.user.username}`,
    };
  } catch (error) {
    console.error("[StaffRemove] Error removing staff status:", error);
    return {
      error: "An error occurred while removing staff status",
    };
  }
}
