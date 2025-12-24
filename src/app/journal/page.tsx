'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { JournalEditor } from '@/components/journal/journal-editor'
import { JournalList } from '@/components/journal/journal-list'
import { Nav } from '@/components/layout/nav'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function JournalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Prevent SSR/hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!mounted) return
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [mounted, status, router])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSave = () => {
    // Refresh the list when a new entry is saved
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {/* Page Header */}
          <header className="mb-8 text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Daily Journal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Track your mood, energy, and reflections. Build a consistent journaling habit for personal growth.
            </p>
          </header>

          {/* Layout: Editor + List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Journal Editor - Sticky on desktop */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <JournalEditor onSave={handleSave} />
            </div>

            {/* Visual Separator */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

            {/* Journal History */}
            <div className="pt-6 lg:pt-0">
              <JournalList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
