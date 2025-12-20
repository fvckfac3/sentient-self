'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navLinks = [
    { href: '/chat', label: 'Chat', enabled: true },
    { href: '/exercises', label: 'Exercises', enabled: true },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <div className="flex items-center">
            <Link href="/chat" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-lg text-foreground hidden sm:block">
                Sentient Self
              </span>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.enabled ? link.href : '#'}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : link.enabled
                    ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    : 'text-muted-foreground cursor-not-allowed opacity-50',
                  !link.enabled && 'pointer-events-none'
                )}
                aria-disabled={!link.enabled}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - User Info & Sign Out */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">{session.user.email}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {session.user.subscriptionTier || 'FREE'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
