'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useConversationStore } from '@/store/conversation'
import { useAuthStore } from '@/store/auth'
import { ChatInterface } from '@/components/chat/chat-interface'
import { CrisisScreen } from '@/components/chat/crisis-screen'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, hasOnboardingCompleted } = useAuthStore()
  const { crisisMode } = useConversationStore()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent SSR/hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!hasOnboardingCompleted()) {
      router.push('/onboarding')
      return
    }

    setIsLoading(false)
  }, [mounted, session, status, hasOnboardingCompleted, router])

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AnimatedBackground />
      <Nav />
      <ChatInterface />
    </div>
  )
}