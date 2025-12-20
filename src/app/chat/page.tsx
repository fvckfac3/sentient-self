'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useConversationStore } from '@/store/conversation'
import { useAuthStore } from '@/store/auth'
import { ChatInterface } from '@/components/chat/chat-interface'
import { CrisisScreen } from '@/components/chat/crisis-screen'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, hasOnboardingCompleted } = useAuthStore()
  const { crisisMode, state } = useConversationStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!hasOnboardingCompleted()) {
      router.push('/onboarding')
      return
    }

    setIsLoading(false)
  }, [session, status, hasOnboardingCompleted, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (crisisMode) {
    return <CrisisScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto h-screen flex">
        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>

        {/* Sidebar - Exercise suggestions, analytics, etc. */}
        <div className="w-80 border-l border-border p-4 hidden lg:block">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Session Info</h3>
              <div className="text-sm text-muted-foreground">
                <p>State: {state}</p>
                <p>User: {user?.email}</p>
                <p>Tier: {user?.subscriptionTier}</p>
              </div>
            </div>
            
            {/* Exercise suggestions will appear here when available */}
          </div>
        </div>
      </div>
    </div>
  )
}