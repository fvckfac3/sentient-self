'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CreditCard, 
  Sparkles, 
  Check,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Unlimited conversations',
      'Daily journaling',
      '5 exercises per month',
      'DeepSeek AI model',
    ],
  },
  {
    name: 'Premium',
    price: '$14.99',
    period: 'per month',
    features: [
      'Everything in Free',
      'Unlimited exercises',
      'All AI models (GPT-4, Claude, Gemini)',
      'AI journal insights',
      'Analytics dashboard',
      'Priority support',
    ],
    highlighted: true,
  },
]

export default function BillingPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  const user = session?.user as any
  const subscriptionTier = user?.subscriptionTier || 'FREE'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [mounted, status])

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Nav />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    You are currently on the {subscriptionTier} plan
                  </CardDescription>
                </div>
                <Badge 
                  variant={subscriptionTier === 'PREMIUM' ? 'default' : 'outline'}
                  className={subscriptionTier === 'PREMIUM' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                >
                  {subscriptionTier}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionTier === 'PREMIUM' ? (
                <Button onClick={handleManageSubscription} disabled={loading}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </Button>
              ) : (
                <Button onClick={handleUpgrade} disabled={loading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Upgrade to Premium'}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`border-2 ${plan.highlighted ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
