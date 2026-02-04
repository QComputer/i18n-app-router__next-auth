'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
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
  }
  lang: string
}

export default function SignupForm({ dictionary, lang }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(signup, undefined)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{dictionary.signup.title}</CardTitle>
        <CardDescription>{dictionary.signup.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.message && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {state.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">{dictionary.signup.username}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              required
            />
            {state?.errors?.username && (
              <p className="text-sm text-destructive">{state.errors.username[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dictionary.signup.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
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
          <div className="space-y-2">
            <Label htmlFor="role">{dictionary.signup.role}</Label>
            <Select name="role" defaultValue="CLIENT">
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
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? dictionary.common.loading : dictionary.signup.signupButton}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
