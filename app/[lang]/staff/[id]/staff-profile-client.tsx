"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Briefcase, 
  Users,
  ArrowRight,
  Clock,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { toPersianDigits } from "@/lib/utils"

// Types
interface Staff {
  id: string
  hierarchy: string
  bio: string | null
  isActive: boolean
  isDefault: boolean
  coverImage: string | null
  avatarImage: string | null
  user: {
    id: string
    username: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    organizationType: string
  }
  services: Array<{
    id: string
    name: string
    description: string | null
    duration: number
    price: number | null
    currency: string
    color: string | null
    serviceCategory: {
      id: string
      name: string
    }
  }>
  serviceField: {
    id: string
    name: string
  }[]
}

interface StaffProfileClientProps {
  staff: Staff
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

// Service Card Component
function ServiceCard({ 
  service, 
  lang 
}: { 
  service: Staff['services'][0]
  lang: string 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {service.color && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: service.color }}
                />
              )}
              <h3 className="font-semibold">{service.name}</h3>
            </div>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration} {lang === "fa" ? "دقیقه" : "min"}
              </span>
              {service.price !== null && (
                <span>
                  {lang === "fa" 
                    ? toPersianDigits(service.price.toLocaleString()) 
                    : service.price.toLocaleString()
                  } {service.currency}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Profile Header Component
function ProfileHeader({ 
  staff, 
  isFollowing, 
  followerCount, 
  lang, 
  onFollowToggle 
}: StaffProfileClientProps & {
  onFollowToggle: () => Promise<void>
}) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full bg-muted overflow-hidden relative">
        {staff.coverImage ? (
          <Image 
            src={staff.coverImage} 
            alt="Cover" 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
      </div>
      
      {/* Avatar and Info */}
      <div className="container mx-auto px-4 -mt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <UserAvatar
              avatarImage={staff.avatarImage}
              fallbackImage={staff.user.image}
              name={staff.user.name}
              size="h-32 w-32 border-4 border-background shadow-lg"
            />
            <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
              {staff.hierarchy}
            </Badge>
          </div>
          
          {/* Staff Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{staff.user.name}</h1>
                {staff.serviceField && staff.serviceField.length > 0 && (
                  <p className="text-muted-foreground">{staff.serviceField.map(sf => sf.name).join(", ")}</p>
                )}
                <Link 
                  href={`/${lang}/o/${staff.organization.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary mt-1 inline-flex items-center"
                >
                  {staff.organization.name}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
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
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{staff.services.length}</span>
            <span className="text-sm text-muted-foreground">Services</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Content Component
function ProfileContent({ staff, lang }: { staff: Staff; lang: string }) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  // Group services by category
  const servicesByCategory = staff.services.reduce((acc, service) => {
    const categoryName = service.serviceCategory.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(service)
    return acc
  }, {} as Record<string, typeof staff.services>)
  
  const categories = Object.keys(servicesByCategory)
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bio Card */}
          {staff.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{staff.bio}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {staff.user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${staff.user.email}`} className="text-muted-foreground hover:text-primary">
                    {staff.user.email}
                  </a>
                </div>
              )}
              {staff.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${staff.user.phone}`} className="text-muted-foreground hover:text-primary">
                    {staff.user.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/${lang}/o/${staff.organization.slug}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{staff.organization.name}</p>
                  <p className="text-sm text-muted-foreground">{staff.organization.organizationType}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
          
          {/* Service Field */}
          {staff.serviceField && (
            <Card>
              <CardHeader>
                <CardTitle>Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                {staff.serviceField.length > 0 && (
                <Badge variant="outline">{staff.serviceField.map(sf => sf.name).join(", ")}</Badge>
              )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content - Services */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="secondary">{category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({servicesByCategory[category].length} services)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {servicesByCategory[category].map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service}
                          lang={lang}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No services available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main Client Component
export function StaffProfileClient({ 
  staff, 
  isFollowing: initialIsFollowing, 
  followerCount, 
  lang 
}: StaffProfileClientProps) {
  const t = useTranslation(lang)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowTarget(staff.id, "STAFF")
        setIsFollowing(false)
      } else {
        await followTarget(staff.id, "STAFF")
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
        staff={staff}
        isFollowing={isFollowing}
        followerCount={followerCount}
        lang={lang}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Content */}
      <ProfileContent staff={staff} lang={lang} />
      
      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {staff.user.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
