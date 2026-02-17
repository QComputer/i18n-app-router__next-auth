"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  /** Primary avatar image URL (from avatarImage field) */
  avatarImage?: string | null
  /** Fallback avatar image URL (from user.image field) */
  fallbackImage?: string | null
  /** User name for fallback initials */
  name?: string | null
  /** Avatar size class - default "h-10 w-10" */
  size?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * UserAvatar - A unified avatar component that:
 * 1. Prioritizes avatarImage over fallbackImage
 * 2. Handles /disk/uploads path prefix
 * 3. Falls back to initials when no image available
 */
export function UserAvatar({
  avatarImage,
  fallbackImage,
  name,
  size = "h-10 w-10",
  className,
}: UserAvatarProps) {
  // Determine the best image to use
  const primaryImage = avatarImage || fallbackImage
  
  // Process the image URL to handle /disk/uploads paths
  const processedSrc = processAvatarUrl(primaryImage)
  
  // Generate initials from name
  const initials = getInitials(name)

  return (
    <Avatar className={cn(size, "flex-shrink-0", className)}>
      {processedSrc ? (
        <AvatarImage 
          src={processedSrc} 
          alt={name || "User avatar"} 
        />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

/**
 * Process avatar URL to handle /disk/uploads path
 */
function processAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  
  // If already a full URL (http/https), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  
  // If it's a /disk/uploads path, add the prefix for Next.js
  if (url.startsWith("/disk/uploads") || url.startsWith("disk/uploads")) {
    return url
  }
  
  // If it's a relative path starting with /uploads, process it
  if (url.startsWith("/uploads") || url.startsWith("uploads/")) {
    return url
  }
  
  // For other relative paths, assume they need /disk/uploads prefix
  return `/disk/uploads/${url.replace(/^\//, "")}`
}

/**
 * Generate initials from a name
 */
function getInitials(name?: string | null): string {
  if (!name) return "?"
  
  // Handle Persian/Arabic names (first letter of first and last word)
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  // Return first letter of first two words
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * StaffAvatar - Specialized avatar for staff members
 * Uses staff.avatarImage first, then falls back to staff.user.image
 */
interface StaffAvatarProps {
  /** Staff member with user relation */
  staff: {
    avatarImage?: string | null
    user: {
      image?: string | null
      name?: string | null
    }
  }
  size?: string
  className?: string
}

export function StaffAvatar({ staff, size, className }: StaffAvatarProps) {
  return (
    <UserAvatar
      avatarImage={staff.avatarImage}
      fallbackImage={staff.user.image}
      name={staff.user.name}
      size={size}
      className={className}
    />
  )
}

/**
 * UserListAvatar - For displaying users in lists
 */
interface UserListAvatarProps {
  user: {
    avatarImage?: string | null
    image?: string | null
    name?: string | null
  }
  size?: string
  className?: string
}

export function UserListAvatar({ user, size, className }: UserListAvatarProps) {
  return (
    <UserAvatar
      avatarImage={user.avatarImage}
      fallbackImage={user.image}
      name={user.name}
      size={size}
      className={className}
    />
  )
}
