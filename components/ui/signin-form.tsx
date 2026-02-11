'use client'

import { useState, useTransition } from 'react'
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
      forgotPassword: string
      noAccount: string
      signUp: string
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
 * Uses useTransition for loading state management.
 */
export function SigninForm({ dictionary, lang }: SigninFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<FormState>(undefined)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await signInAction(state, formData)
        
        // If signInAction returns success, the redirect will happen automatically
        // because we're using redirect: true in the action
        if (result?.success) {
          router.refresh()
        }
      } catch (error) {
        // If it's a redirect error, let it propagate
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          throw error
        }
        // For other errors, set the state
        console.error('Sign in error:', error)
      }
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{dictionary.signin.title}</CardTitle>
        <CardDescription>{dictionary.signin.description}</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
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
              disabled={isPending}
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
              disabled={isPending}
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
            disabled={isPending}
          >
            {isPending ? dictionary.common.loading : dictionary.signin.signinButton}
          </Button>
          
          {/* Forgot Password Link */}
          <div className="w-full flex justify-between items-center">
            <Link
              href={`/${lang}/auth/forgot-password`}
              className="text-sm font-medium text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
            >
              {dictionary.signin.forgotPassword || "Forgot password?"}
            </Link>
          </div>
          
          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            {dictionary.signin.noAccount || "Do not have an account?"}{" "}
            <Link
              href={`/${lang}/auth/signup`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {dictionary.signin.signUp || "Sign up"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
