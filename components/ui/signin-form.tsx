'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { signInAction } from '@/app/actions/signin'
import type { FormState } from '@/lib/definitions'

interface SigninFormProps {
  dictionary: {
    signin: {
      title: string
      description: string
      username: string
      password: string
      signinButton: string
    }
    common: {
      loading: string
    }
  }
  lang: string
}

/**
 * Sign In Form Component
 * 
 * Client component that handles user sign-in with username and password.
 * Uses useState for form state management and handles submission
 * with the server action.
 */
export function SigninForm({ dictionary, lang }: SigninFormProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(event.currentTarget)
      const result = await signInAction(state, formData)
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
        <CardTitle>{dictionary.signin.title}</CardTitle>
        <CardDescription>{dictionary.signin.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">{dictionary.signin.username}</Label>
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
            <Label htmlFor="password">{dictionary.signin.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          
          {/* Error Message Display */}
          {state?.message && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {state.message}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          {/* Submit Button */}
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? dictionary.common.loading : dictionary.signin.signinButton}
          </Button>
          
          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Do not have an account?{" "}
            <Link
              href={`/${lang}/auth/signup`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
