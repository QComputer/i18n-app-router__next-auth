"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/app/actions/signout"
import { Settings, LogOut, LayoutDashboard } from "lucide-react"

/**
 * User Menu Component
 * 
 * Displays a user avatar dropdown menu for authenticated users.
 * Shows user info and provides navigation to dashboard, settings,
 * and sign out options.
 * 
 * @param user - The authenticated user object
 * @param locale - Current locale for navigation
 * @param dictionary - Translation dictionary
 */
interface UserMenuProps {
  user: {
    username: string
    role: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  locale: string
  dictionary: {
    navigation?: {
      role?: string
      dashboard?: string
      settings?: string
      logout?: string
    }
    auth?: {
      signIn?: string
      signUp?: string
    }
  }
}

export function UserMenu({ user, locale, dictionary }: UserMenuProps) {
  // Generate initials from user name or username
  const initials = user.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.username?.toString().slice(0, 2).toUpperCase()

  const navDict = dictionary.navigation || {}
  
  const handleSignOut = async () => {
    // Call the server action to sign out
    await signOutAction(locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name || user.username} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {initials}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {navDict.role || "Role"}: {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/dashboard`} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{navDict.dashboard || "Dashboard"}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/settings`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{navDict.settings || "Settings"}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <button 
            onClick={handleSignOut}
            className="w-full cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{navDict.logout || "Logout"}</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Auth Navigation Component
 * 
 * Displays either sign in/sign up buttons for guests
 * or the user menu for authenticated users.
 * 
 * @param session - The current session object (null if not authenticated)
 * @param locale - Current locale for navigation
 * @param dictionary - Translation dictionary
 */
interface AuthNavProps {
  session: {
    user: {
      id: string
      username: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  } | null
  locale: string
  dictionary: {
    navigation?: {
      role?: string
      dashboard?: string
      settings?: string
      logout?: string
    }
    auth?: {
      signIn?: string
      signUp?: string
    }
  }
}

export function AuthNav({ session, locale, dictionary }: AuthNavProps) {
  // If user is authenticated, show user avatar menu
  if (session?.user) {
    return <UserMenu user={session.user} locale={locale} dictionary={dictionary} />
  }

  // If user is not authenticated, show sign in/sign up buttons
  const authDict = dictionary.auth || {}
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/${locale}/auth/signin`}>
          {authDict.signIn || "Sign In"}
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link href={`/${locale}/auth/signup`}>
          {authDict.signUp || "Sign Up"}
        </Link>
      </Button>
    </div>
  )
}
