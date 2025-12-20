'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PricingCard } from '@/components/billing/pricing-card'

export function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showPricing, setShowPricing] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const navLinks = [
    { href: '/chat', label: 'Chat', enabled: true },
    { href: '/exercises', label: 'Exercises', enabled: true },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to open billing portal')
        setPortalLoading(false)
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Something went wrong')
      setPortalLoading(false)
    }
  }

  return (
    <>
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
                    <button
                      onClick={session.user.subscriptionTier === 'FREE' ? () => setShowPricing(true) : handleManageSubscription}
                      disabled={portalLoading}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={session.user.subscriptionTier === 'FREE' ? 'Upgrade plan' : 'Manage subscription'}
                    >
                      {portalLoading ? 'Loading...' : (session.user.subscriptionTier || 'FREE')}
                    </button>
                  </div>
                  {session.user.subscriptionTier === 'FREE' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowPricing(true)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 md:hidden"
                    >
                      Upgrade
                    </Button>
                  )}
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

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Choose Your Plan</h2>
              <button
                onClick={() => setShowPricing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PricingCard />
          </div>
        </div>
      )}
    </>
  )
}
