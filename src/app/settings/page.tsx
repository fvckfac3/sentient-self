'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Sparkles,
  ChevronRight,
  CreditCard
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

const settingsSections = [
  {
    title: 'Profile',
    description: 'Manage your account details',
    icon: User,
    href: '/settings/profile',
    color: 'blue'
  },
  {
    title: 'Billing & Subscription',
    description: 'Manage your plan and payment',
    icon: CreditCard,
    href: '/settings/billing',
    color: 'green'
  },
  {
    title: 'AI Preferences',
    description: 'Choose your default AI model',
    icon: Sparkles,
    href: '/settings/ai',
    color: 'purple'
  },
  {
    title: 'Notifications',
    description: 'Configure reminders and alerts',
    icon: Bell,
    href: '/settings/notifications',
    color: 'orange'
  },
  {
    title: 'Privacy & Safety',
    description: 'Manage your data and crisis settings',
    icon: Shield,
    href: '/settings/privacy',
    color: 'red'
  },
  {
    title: 'Appearance',
    description: 'Theme and display preferences',
    icon: Palette,
    href: '/settings/appearance',
    color: 'pink'
  },
]

const colorVariants: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  green: 'bg-green-500/10 text-green-500 border-green-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [mounted, status])

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your Sentient Self experience
          </p>
        </motion.div>

        <div className="grid gap-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon
            const colorClass = colorVariants[section.color]

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
              >
                <Link href={section.href}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border-2 ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
