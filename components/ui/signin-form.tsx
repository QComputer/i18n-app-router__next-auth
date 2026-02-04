'use client'

import { signInAction } from '@/app/actions/signin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState } from 'react'

interface SigninFormProps {
  dictionary: {
    signin: {
      title: string
      description: string
      username: string
      password: string
      signinButton: string
      error: string
    }
  }
  lang: string
}

export function SigninForm({ dictionary, lang }: SigninFormProps) {
  const [state, formAction, pending] = useActionState(signInAction, undefined)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{dictionary.signin.title}</CardTitle>
        <CardDescription>{dictionary.signin.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{dictionary.signin.username}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dictionary.signin.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? '...' : dictionary.signin.signinButton}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
