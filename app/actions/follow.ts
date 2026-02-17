/**
 * Follow/Unfollow Actions
 * 
 * Handles following and unfollowing users, organizations, and other targets
 */

"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export type FollowResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Follow a target (user, organization, service, etc.)
 */
export async function followTarget(
  targetId: string,
  targetType: "ORGANIZATION" | "SERVICE" | "SERVICE_CATEGORY" | "SERVICE_FIELD" | "PRODUCT" | "PRODUCT_CATEGORY" | "STAFF" | "DRIVER" | "CLIENT"
): Promise<FollowResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "You must be logged in to follow" };
    }

    const userId = session.user.id;
    
    if (!targetId) {
      return { success: false, error: "Target ID is required" };
    }

    // Check if already following
    const existingFollow = await prisma.following.findFirst({
      where: {
        userId,
        targetId,
        TargetType: targetType,
      },
    });

    if (existingFollow) {
      return { success: false, error: "Already following this target" };
    }

    // Create follow
    await prisma.following.create({
      data: {
        userId,
        targetId,
        TargetType: targetType,
      },
    });

    revalidatePath("/profile");
    
    return { success: true, message: "Successfully followed" };
  } catch (error) {
    console.error("Follow error:", error);
    return { success: false, error: "Failed to follow" };
  }
}

/**
 * Unfollow a target
 */
export async function unfollowTarget(
  targetId: string,
  targetType: "ORGANIZATION" | "SERVICE" | "SERVICE_CATEGORY" | "SERVICE_FIELD" | "PRODUCT" | "PRODUCT_CATEGORY" | "STAFF" | "DRIVER" | "CLIENT"
): Promise<FollowResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "You must be logged in to unfollow" };
    }

    const userId = session.user.id;
    
    if (!targetId) {
      return { success: false, error: "Target ID is required" };
    }

    // Check if following
    const existingFollow = await prisma.following.findFirst({
      where: {
        userId,
        targetId,
        TargetType: targetType,
      },
    });

    if (!existingFollow) {
      return { success: false, error: "Not following this target" };
    }

    // Delete follow
    await prisma.following.delete({
      where: {
        id: existingFollow.id,
      },
    });

    revalidatePath("/profile");
    
    return { success: true, message: "Successfully unfollowed" };
  } catch (error) {
    console.error("Unfollow error:", error);
    return { success: false, error: "Failed to unfollow" };
  }
}

/**
 * Check if current user is following a target
 */
export async function isFollowing(
  targetId: string,
  targetType: "ORGANIZATION" | "SERVICE" | "SERVICE_CATEGORY" | "SERVICE_FIELD" | "PRODUCT" | "PRODUCT_CATEGORY" | "STAFF" | "DRIVER" | "CLIENT"
): Promise<boolean> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return false;
    }

    const userId = session.user.id;
    
    const existingFollow = await prisma.following.findFirst({
      where: {
        userId,
        targetId,
        TargetType: targetType,
      },
    });

    return !!existingFollow;
  } catch (error) {
    console.error("IsFollowing error:", error);
    return false;
  }
}

/**
 * Get follower count for a target
 */
export async function getFollowerCount(
  targetId: string,
  targetType: "ORGANIZATION" | "SERVICE" | "SERVICE_CATEGORY" | "SERVICE_FIELD" | "PRODUCT" | "PRODUCT_CATEGORY" | "STAFF" | "DRIVER" | "CLIENT"
): Promise<number> {
  try {
    const count = await prisma.following.count({
      where: {
        targetId,
        TargetType: targetType,
      },
    });

    return count;
  } catch (error) {
    console.error("GetFollowerCount error:", error);
    return 0;
  }
}

/**
 * Get all followers of a target
 */
export async function getFollowers(
  targetId: string,
  targetType: "ORGANIZATION" | "SERVICE" | "SERVICE_CATEGORY" | "SERVICE_FIELD" | "PRODUCT" | "PRODUCT_CATEGORY" | "STAFF" | "DRIVER" | "CLIENT",
  limit: number = 20,
  offset: number = 0
) {
  try {
    const followers = await prisma.following.findMany({
      where: {
        targetId,
        TargetType: targetType,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            avatarImage: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    return followers;
  } catch (error) {
    console.error("GetFollowers error:", error);
    return [];
  }
}

/**
 * Get all followings of a user
 */
export async function getUserFollowings(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const followings = await prisma.following.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return followings;
  } catch (error) {
    console.error("GetUserFollowings error:", error);
    return [];
  }
}
