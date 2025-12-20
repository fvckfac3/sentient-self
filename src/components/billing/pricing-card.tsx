'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { UpgradeButton } from './upgrade-button'

export function PricingCard() {
  const { data: session } = useSession()
  const currentTier = session?.user?.subscriptionTier || 'FREE'
  const [portalLoading, setPortalLoading] = useState(false)

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

  const tiers = [
    {
      name: 'FREE',
      price: '$0',
      period: 'forever',
      features: [
        'Basic AI chat coaching',
        'Limited exercises (5/month)',
        'Daily journal entries',
        'DeepSeek R1 model only',
      ],
      cta: null,
      color: 'gray',
    },
    {
      name: 'PREMIUM',
      price: '$14.99',
      period: 'per month',
      features: [
        'Advanced AI coaching',
        'Unlimited exercises',
        'AI journal analysis',
        'Full analytics dashboard',
        'Gamification system',
        'Access to all AI models',
        'Priority support',
      ],
      cta: 'premium',
      color: 'blue',
    },
    {
      name: 'INSTITUTION',
      price: 'Custom',
      period: 'per seat/month',
      features: [
        'Everything in Premium',
        'Team admin dashboard',
        'User seat management',
        'Aggregate analytics',
        'Crisis alert dispatch',
        'Bulk reporting',
        'Dedicated support',
      ],
      cta: 'institution',
      color: 'orange',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {tiers.map((tier) => {
        const isCurrent = currentTier === tier.name
        
        return (
          <div
            key={tier.name}
            className={`relative border rounded-xl p-6 bg-card ${
              isCurrent ? 'border-green-500 ring-2 ring-green-500' : 'border-border'
            }`}
          >
            {isCurrent && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Current Plan
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2 text-foreground">{tier.name}</h3>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">{tier.price}</span>
              <span className="text-muted-foreground ml-2">{tier.period}</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            
            {tier.cta && !isCurrent && (
              <UpgradeButton
                plan={tier.cta as 'premium' | 'institution'}
                className={`w-full ${
                  tier.color === 'blue'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                Upgrade to {tier.name}
              </UpgradeButton>
            )}
            
            {isCurrent && tier.name !== 'FREE' && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full px-6 py-3 rounded-lg font-semibold border-2 border-border hover:border-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
