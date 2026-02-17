"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Store,
  ArrowRight,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { toPersianDigits } from "@/lib/utils"

// Types
interface Product {
  id: string
  name: string
  image: string | null
  coverImage: string | null
  avatarImage: string | null
  price: number | null
  currency: string
  color: string | null
  isActive: boolean
  productCategory: {
    id: string
    name: string
    description: string | null
    image: string | null
    coverImage: string | null
    avatarImage: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    organizationType: string
    phone: string | null
    email: string | null
    address: string | null
    image: string | null
    coverImage: string | null
    avatarImage: string | null
  }
}

interface ProductProfileClientProps {
  product: Product
  isFollowing: boolean
  followerCount: number
  lang: string
}

// Helper function for translation
function useTranslation(lang: string) {
  const t = (key: string, fallback: string): string => {
    return fallback
  }
  return t
}

// Profile Header Component
function ProfileHeader({ 
  product, 
  isFollowing, 
  followerCount, 
  lang, 
  onFollowToggle 
}: ProductProfileClientProps & {
  onFollowToggle: () => Promise<void>
}) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full bg-muted overflow-hidden relative">
        {product.coverImage ? (
          <Image 
            src={product.coverImage} 
            alt="Cover" 
            fill 
            className="object-cover"
          />
        ) : product.image ? (
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
      </div>
      
      {/* Product Info */}
      <div className="container mx-auto px-4 -mt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 border-4 border-background shadow-lg rounded-lg overflow-hidden bg-background">
              {product.avatarImage || product.image ? (
                <Image 
                  src={(product.avatarImage || product.image) as string} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Store className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
              Product
            </Badge>
          </div>
          
          {/* Product Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <Link 
                  href={`/${lang}/o/${product.organization.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary mt-1 inline-flex items-center"
                >
                  {product.organization.name}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                <div className="mt-2">
                  <Badge variant="outline">{product.productCategory.name}</Badge>
                </div>
              </div>
              
              {/* Follow Button */}
              <Button 
                onClick={onFollowToggle}
                size="lg"
                className="min-w-[120px]"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-8 mt-6 pt-6 border-t">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{followerCount}</span>
            <span className="text-sm text-muted-foreground">Followers</span>
          </div>
          {product.price !== null && (
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {lang === "fa" 
                  ? toPersianDigits(product.price.toLocaleString()) 
                  : product.price.toLocaleString()
                } {product.currency}
              </span>
              <span className="text-sm text-muted-foreground">Price</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Profile Content Component
function ProfileContent({ product, lang }: { product: Product; lang: string }) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Info */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg py-1">
                {product.productCategory.name}
              </Badge>
              {product.productCategory.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {product.productCategory.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/${lang}/o/${product.organization.slug}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{product.organization.name}</p>
                  <p className="text-sm text-muted-foreground">{product.organization.type}</p>
                </div>
              </Link>
              
              <div className="mt-4 space-y-2">
                {product.organization.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${product.organization.phone}`} className="text-muted-foreground hover:text-primary">
                      {product.organization.phone}
                    </a>
                  </div>
                )}
                {product.organization.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${product.organization.email}`} className="text-muted-foreground hover:text-primary">
                      {product.organization.email}
                    </a>
                  </div>
                )}
                {product.organization.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{product.organization.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              {product.isActive ? (
                <Badge className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge variant="secondary">Unavailable</Badge>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.productCategory.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {product.price !== null 
                      ? `${lang === "fa" ? toPersianDigits(product.price.toLocaleString()) : product.price.toLocaleString()} ${product.currency}`
                      : "Contact for price"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{product.isActive ? "Available" : "Unavailable"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/${lang}/o/${product.organization.slug}`} className="block">
                <Button variant="outline" className="w-full">
                  View Store
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main Client Component
export function ProductProfileClient({ 
  product, 
  isFollowing: initialIsFollowing, 
  followerCount, 
  lang 
}: ProductProfileClientProps) {
  const t = useTranslation(lang)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowTarget(product.id, "PRODUCT")
        setIsFollowing(false)
      } else {
        await followTarget(product.id, "PRODUCT")
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={lang === "fa" || lang === "ar" ? "rtl" : "ltr"} dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <ProfileHeader 
        product={product}
        isFollowing={isFollowing}
        followerCount={followerCount}
        lang={lang}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Content */}
      <ProfileContent product={product} lang={lang} />
      
      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {product.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
