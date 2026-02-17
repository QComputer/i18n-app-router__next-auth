import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { UserProfileClient } from "./user-profile-client"

// Types
interface UserProfilePageProps {
  params: {
    lang: string
    username: string
  }
}

// Server component to fetch user data
export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { lang, username } = params
  
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      staff: {
        include: {
          organization: true
        }
      },
      driver: true
    }
  })
  
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The requested user profile does not exist.</p>
      </div>
    )
  }
  
  // Check if current user is following this user
  const session = await auth()
  const isFollowing = session?.user ? await checkIsFollowing(session.user.id, user.id) : false
  
  // Get follower count
  const followerCount = await prisma.following.count({
    where: {
      targetId: user.id,
      TargetType: "CLIENT"
    }
  })
  
  // Get following count
  const followingCount = await prisma.following.count({
    where: {
      userId: user.id
    }
  })
  
  return (
    <UserProfileClient
      user={user}
      isFollowing={isFollowing}
      followerCount={followerCount}
      followingCount={followingCount}
      lang={lang}
    />
  )
}

async function checkIsFollowing(userId: string, targetId: string): Promise<boolean> {
  const follow = await prisma.following.findUnique({
    where: {
      userId_targetId_TargetType: {
        userId,
        targetId,
        TargetType: "CLIENT" as const
      }
    }
  })
  
  return !!follow
}
