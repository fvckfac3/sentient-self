'use client'

import { useEffect, useState } from 'react'
import { getProviders, signIn, type ClientSafeProvider } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface OAuthButtonsProps {
  callbackUrl: string
  disabled?: boolean
}

/**
 * Buttons for the OAuth providers enabled in src/lib/auth.ts. Renders nothing
 * when none are configured, so we never show a button that leads to an error.
 */
export function OAuthButtons({ callbackUrl, disabled }: OAuthButtonsProps) {
  const [providers, setProviders] = useState<ClientSafeProvider[]>([])
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    getProviders()
      .then(result => setProviders(Object.values(result ?? {}).filter(p => p.type === 'oauth')))
      .catch(() => setProviders([]))
  }, [])

  if (providers.length === 0) return null

  return (
    <>
      <div className="space-y-2">
        {providers.map(provider => (
          <Button
            key={provider.id}
            variant="outline"
            className="w-full"
            disabled={disabled || pending !== null}
            onClick={() => {
              setPending(provider.id)
              signIn(provider.id, { callbackUrl }).catch(() => setPending(null))
            }}
          >
            Continue with {provider.name}
          </Button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>
    </>
  )
}
