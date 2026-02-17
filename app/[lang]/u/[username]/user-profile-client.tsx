"use client"

import Image from "next/image"
import { useState } from "react"
import { 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Briefcase, 
  Users,
  ArrowRight,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { Separator } from "@/components/ui/separator"

// Types
interface User {
  id: string
  username: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  coverImage: string | null
  avatarImage: string | null
  role: string
  staff?: {
    id: string
    hierarchy: string
    bio: string | null
    organization: {
      id: string
      name: string
      slug: string
    }
  } | null
  driver?: {
    id: string
  } | null
}

interface UserProfileClientProps {
  user: User
  isFollowing: boolean
  followerCount: number
  followingCount: number
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
  user, 
  isFollowing, 
  followerCount, 
  followingCount, 
  lang, 
  onFollowToggle 
}: UserProfileClientProps & {
  onFollowToggle: () => Promise<void>
}) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full bg-muted overflow-hidden relative">
        {user.coverImage ? (
          <Image 
            src={user.coverImage} 
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
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              {user.avatarImage || user.image ? (
                <AvatarImage src={(user.avatarImage || user.image) as string} alt={user.name || "User"} />
              ) : (
                <AvatarFallback className="text-4xl">
                  {user.name?.charAt(0) || user.username.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
              {user.role}
            </Badge>
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.staff?.organization && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Works at {user.staff.organization.name}
                  </p>
                )}
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
            <span className="text-2xl font-bold">{followingCount}</span>
            <span className="text-sm text-muted-foreground">Following</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Content Component
function ProfileContent({ user, lang }: { user: User; lang: string }) {
  const t = useTranslation(lang)
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bio Card */}
          {user.staff?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user.staff.bio}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${user.email}`} className="text-muted-foreground hover:text-primary">
                    {user.email}
                  </a>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${user.phone}`} className="text-muted-foreground hover:text-primary">
                    {user.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Role Info */}
          {user.staff || user.driver ? (
            <Card>
              <CardHeader>
                <CardTitle>Professional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.staff && (
                  <>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Role: {user.staff.hierarchy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Organization: {user.staff.organization.name}</span>
                    </div>
                  </>
                )}
                {user.driver && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Role: Driver</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">@{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone || "Not provided"}</p>
                </div>
              </div>
              
              {user.staff && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{user.staff.organization.name}</p>
                  <p className="text-sm text-muted-foreground">Hierarchy</p>
                  <p className="font-medium">{user.staff.hierarchy}</p>
                </div>
              )}
              
              {user.driver && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Driver Status</p>
                  <p className="font-medium">Active</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Additional Sections based on role */}
          {user.staff?.organization && (
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{user.staff.organization.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      View {user.staff.organization.name} profile
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Client Component
export function UserProfileClient({ 
  user, 
  isFollowing: initialIsFollowing, 
  followerCount, 
  followingCount, 
  lang 
}: UserProfileClientProps) {
  const t = useTranslation(lang)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowTarget(user.id, "CLIENT")
        setIsFollowing(false)
      } else {
        await followTarget(user.id, "CLIENT")
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
        user={user}
        isFollowing={isFollowing}
        followerCount={followerCount}
        followingCount={followingCount}
        lang={lang}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Content */}
      <ProfileContent user={user} lang={lang} />
      
      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {user.name || user.username}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
