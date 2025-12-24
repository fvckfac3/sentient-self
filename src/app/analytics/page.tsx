'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  BarChart3,
  Lock
} from 'lucide-react'

import { StatCard } from '@/components/analytics/stat-card'
import { MoodChart } from '@/components/analytics/mood-chart'
import { StreakDisplay } from '@/components/analytics/streak-display'
import { ExerciseStats } from '@/components/analytics/exercise-stats'
import { FrameworkEffectiveness } from '@/components/analytics/framework-effectiveness'
import { AnalyticsSkeleton } from '@/components/analytics/analytics-skeleton'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnalyticsSummary } from '@/types/analytics'
import { Nav } from '@/components/layout/nav'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Prevent SSR/hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [mounted, status])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics')
        
        if (response.status === 403) {
          setError('premium_required')
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }

        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError('fetch_error')
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session])

  // Premium required state
  if (error === 'premium_required') {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="max-w-md border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block mb-4"
                >
                  <Lock className="h-16 w-16 text-primary mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
                <p className="text-muted-foreground mb-6">
                  Analytics dashboard is available for Premium subscribers. 
                  Upgrade to track your therapeutic journey.
                </p>
                <Button size="lg" className="w-full">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
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
      
      <div className="relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b bg-background/80 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <BarChart3 className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">Your Journey</h1>
                <p className="text-muted-foreground">
                  Track your growth and celebrate your progress
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <AnalyticsSkeleton />
          ) : analytics ? (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Journal Entries"
                  value={analytics.totalJournalEntries}
                  subtitle="Thoughts captured"
                  icon={BookOpen}
                  color="blue"
                  delay={0}
                />
                <StatCard
                  title="Conversations"
                  value={analytics.totalConversations}
                  subtitle="Therapeutic chats"
                  icon={MessageSquare}
                  color="green"
                  delay={0.1}
                />
                <StatCard
                  title="Exercises Done"
                  value={analytics.exerciseStats.completed}
                  subtitle={`${analytics.exerciseStats.completionRate}% completion rate`}
                  icon={TrendingUp}
                  color="purple"
                  delay={0.2}
                />
                <StatCard
                  title="Member Since"
                  value={new Date(analytics.memberSince).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                  subtitle="On your healing journey"
                  icon={Calendar}
                  color="orange"
                  delay={0.3}
                />
              </div>

              {/* Streak Display */}
              <StreakDisplay data={analytics.streakData} />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoodChart data={analytics.moodTrend} />
                <ExerciseStats data={analytics.exerciseStats} />
              </div>

              {/* Framework Effectiveness */}
              <FrameworkEffectiveness data={analytics.frameworkEffectiveness} />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load analytics. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
