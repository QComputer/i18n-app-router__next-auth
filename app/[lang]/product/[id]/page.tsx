import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { ProductProfileClient } from "./product-profile-client"

// Types
interface ProductProfilePageProps {
  params: {
    lang: string
    id: string
  }
}

// Server component to fetch product data
export default async function ProductProfilePage({ params }: ProductProfilePageProps) {
  const { lang, id } = await params
  
  // Fetch product data
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      productCategory: true,
      organization: true
    }
  })
  
  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground">The requested product does not exist.</p>
      </div>
    )
  }
  
  // Check if current user is following this product
  const session = await auth()
  const isFollowing = session?.user ? await checkIsFollowing(session.user.id, product.id) : false
  
  // Get follower count
  const followerCount = await prisma.following.count({
    where: {
      targetId: product.id,
      TargetType: "PRODUCT"
    }
  })
  
  return (
    <ProductProfileClient
      product={product}
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
        TargetType: "PRODUCT" as const
      }
    }
  })
  
  return !!follow
}
