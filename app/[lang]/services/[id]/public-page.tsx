import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { ServiceProfileClient } from "./service-profile-client"

// Types
interface ServiceProfilePageProps {
  params: {
    lang: string
    id: string
  }
}

// Server component to fetch service data
export default async function ServiceProfilePage({ params }: ServiceProfilePageProps) {
  const { lang, id } = params
  
  // Fetch service data
  const service = await prisma.service.findUnique({
    where: {
      id,
      isActive: true,
    },
    include: {
      serviceCategory: true,
      staff: {
        include: {
          user: true,
          organization: true
        }
      }
    }
  })
  
  if (!service) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-muted-foreground">The requested service does not exist.</p>
      </div>
    )
  }
  
  // Check if current user is following this service
  const session = await auth()
  const isFollowing = session?.user ? await checkIsFollowing(session.user.id, service.id) : false
  
  // Get follower count
  const followerCount = await prisma.following.count({
    where: {
      targetId: service.id,
      TargetType: "SERVICE"
    }
  })
  
  return (
    <ServiceProfileClient
      service={service}
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
        TargetType: "SERVICE" as const
      }
    }
  })
  
  return !!follow
}
