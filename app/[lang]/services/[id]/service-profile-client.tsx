"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Calendar,
  ArrowRight,
  Check,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { toPersianDigits } from "@/lib/utils"

// Types
interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  coverImage: string | null
  avatarImage: string | null
  price: number | null
  currency: string
  color: string | null
  isActive: boolean
  serviceCategory: {
    id: string
    name: string
    description: string | null
  }
  staff: {
    id: string
    hierarchy: string
    bio: string | null
    user: {
      id: string
      name: string | null
      email: string | null
      phone: string | null
      image: string | null
    }
    organization: {
      id: string
      name: string
      slug: string
      phone: string | null
      email: string | null
      address: string | null
    }
  }
}

interface ServiceProfileClientProps {
  service: Service
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
  service, 
  isFollowing, 
  followerCount, 
  lang, 
  onFollowToggle 
}: ServiceProfileClientProps & {
  onFollowToggle: () => Promise<void>
}) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full bg-muted overflow-hidden relative">
        {service.coverImage ? (
          <Image 
            src={service.coverImage} 
            alt="Cover" 
            fill 
            className="object-cover"
          />
        ) : service.color ? (
          <div 
            className="w-full h-full" 
            style={{ backgroundColor: `${service.color}20` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
      </div>
      
      {/* Service Info */}
      <div className="container mx-auto px-4 -mt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 border-4 border-background shadow-lg rounded-lg overflow-hidden bg-background">
              {service.avatarImage || service.coverImage ? (
                <Image 
                  src={(service.avatarImage || service.coverImage) as string} 
                  alt={service.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
              Service
            </Badge>
          </div>
          
          {/* Service Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{service.name}</h1>
                <Link 
                  href={`/${lang}/o/${service.staff.organization.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary mt-1 inline-flex items-center"
                >
                  {service.staff.organization.name}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{service.serviceCategory.name}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {service.duration} {lang === "fa" ? "دقیقه" : "min"}
                  </Badge>
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
          {service.price !== null && (
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {lang === "fa" 
                  ? toPersianDigits(service.price.toLocaleString()) 
                  : service.price.toLocaleString()
                } {service.currency}
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
function ProfileContent({ service, lang }: { service: Service; lang: string }) {
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
                {service.serviceCategory.name}
              </Badge>
              {service.serviceCategory.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {service.serviceCategory.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Staff Info */}
          <Card>
            <CardHeader>
              <CardTitle>Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/${lang}/staff/${service.staff.id}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <Avatar className="h-12 w-12">
                  {service.staff.user.image ? (
                    <AvatarImage src={service.staff.user.image} alt={service.staff.user.name || ""} />
                  ) : (
                    <AvatarFallback>{service.staff.user.name?.charAt(0) || "?"}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{service.staff.user.name}</p>
                  <p className="text-sm text-muted-foreground">{service.staff.hierarchy}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
          
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/${lang}/o/${service.staff.organization.slug}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{service.staff.organization.name}</p>
                  <p className="text-sm text-muted-foreground">View profile</p>
                </div>
              </Link>
              
              <div className="mt-4 space-y-2">
                {service.staff.organization.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${service.staff.organization.phone}`} className="text-muted-foreground hover:text-primary">
                      {service.staff.organization.phone}
                    </a>
                  </div>
                )}
                {service.staff.organization.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${service.staff.organization.email}`} className="text-muted-foreground hover:text-primary">
                      {service.staff.organization.email}
                    </a>
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
              {service.isActive ? (
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
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{service.serviceCategory.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{service.duration} {lang === "fa" ? "دقیقه" : "minutes"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {service.price !== null 
                      ? `${lang === "fa" ? toPersianDigits(service.price.toLocaleString()) : service.price.toLocaleString()} ${service.currency}`
                      : "Contact for price"
                    }
                  </p>
                </div>
              </div>
              
              {service.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p>{service.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/${lang}/o/${service.staff.organization.slug}/services`} className="block">
                <Button variant="outline" className="w-full">
                  Book This Service
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href={`/${lang}/o/${service.staff.organization.slug}`} className="block">
                <Button variant="ghost" className="w-full">
                  View Organization
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
export function ServiceProfileClient({ 
  service, 
  isFollowing: initialIsFollowing, 
  followerCount, 
  lang 
}: ServiceProfileClientProps) {
  const t = useTranslation(lang)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowTarget(service.id, "SERVICE")
        setIsFollowing(false)
      } else {
        await followTarget(service.id, "SERVICE")
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
        service={service}
        isFollowing={isFollowing}
        followerCount={followerCount}
        lang={lang}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Content */}
      <ProfileContent service={service} lang={lang} />
      
      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {service.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
