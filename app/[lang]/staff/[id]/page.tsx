import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { StaffProfileClient } from "./staff-profile-client"

// Types
interface StaffProfilePageProps {
  params: {
    lang: string
    id: string
  }
}

// Server component to fetch staff data
export default async function StaffProfilePage({ params }: StaffProfilePageProps) {
  const { lang, id } = await params
  
  // Fetch staff data
  const staff = await prisma.staff.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      organization: true,
      services: {
        include: {
          serviceCategory: true
        }
      },
      serviceField: true
    }
  })
  
  if (!staff) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold">Staff not found</h1>
        <p className="text-muted-foreground">The requested staff profile does not exist.</p>
      </div>
    )
  }
  
  // Check if current user is following this staff
  const session = await auth()
  const isFollowing = session?.user ? await checkIsFollowing(session.user.id, staff.id) : false
  
  // Get follower count
  const followerCount = await prisma.following.count({
    where: {
      targetId: staff.id,
      TargetType: "STAFF"
    }
  })
  
  return (
    <StaffProfileClient
      staff={staff}
      isFollowing={isFollowing}
      followerCount={followerCount}
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
        TargetType: "STAFF" as const
      }
    }
  })
  
  return !!follow
}
