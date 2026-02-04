'use client'

import { signOutAction } from '@/app/actions/signout'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

interface SignoutButtonProps {
  dictionary: {
    signout: {
      signoutButton: string
    }
  }
  lang: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SignoutButton({ 
  dictionary, 
  lang, 
  variant = 'ghost', 
  size = 'default',
  className 
}: SignoutButtonProps) {
  const [pending, startTransition] = useTransition()

  const handleSignout = () => {
    startTransition(() => {
      signOutAction(lang)
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignout}
      disabled={pending}
      className={className}
    >
      {pending ? '...' : dictionary.signout.signoutButton}
    </Button>
  )
}
