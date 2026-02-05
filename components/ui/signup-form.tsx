'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { signup } from '@/app/actions/signup'
import type { FormState } from '@/lib/definitions'

interface SignupFormProps {
  dictionary: {
    signup: {
      title: string
      description: string
      username: string
      password: string
      role: string
      signupButton: string
      usernameRequired: string
      passwordRequirements: string
    }
    common: {
      loading: string
    }
    auth?: {
      hasAccount: string
      signIn: string
    }
  }
  lang: string
}

/**
 * Sign Up Form Component
 * 
 * Client component that handles user registration with username, password, and role.
 * Uses useState for form state management and handles submission
 * with the server action.
 */
export default function SignupForm({ dictionary, lang }: SignupFormProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(event.currentTarget)
      // Add locale to formData
      formData.append('locale', lang)
      const result = await signup(state, formData)
      setState(result)
      
      if (result?.success) {
        router.push(`/${lang}/dashboard`)
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{dictionary.signup.title}</CardTitle>
        <CardDescription>{dictionary.signup.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Message */}
          {state?.message && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {state.message}
            </div>
          )}
          
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">{dictionary.signup.username}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              required
              autoComplete="username"
              disabled={isLoading}
            />
            {state?.errors?.username && (
              <p className="text-sm text-destructive">{state.errors.username[0]}</p>
            )}
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">{dictionary.signup.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            {state?.errors?.password && (
              <div className="text-sm text-destructive">
                <p>{dictionary.signup.passwordRequirements}:</p>
                <ul className="list-disc list-inside">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Role Select */}
          <div className="space-y-2">
            <Label htmlFor="role">{dictionary.signup.role}</Label>
            <Select name="role" defaultValue="CLIENT" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIENT">Client</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.role && (
              <p className="text-sm text-destructive">{state.errors.role[0]}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? dictionary.common.loading : dictionary.signup.signupButton}
          </Button>
        </CardFooter>
      </form>
      
      {/* Sign In Link */}
      <div className="p-6 pt-0">
        <p className="text-center text-sm text-muted-foreground">
          {dictionary.auth?.hasAccount || "Already have an account?"}{" "}
          <Link
            href={`/${lang}/auth/signin`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {dictionary.auth?.signIn || "Sign in"}
          </Link>
        </p>
      </div>
    </Card>
  )
}
