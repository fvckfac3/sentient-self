'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Heart, Shield, Users } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { hasOnboardingCompleted } = useAuthStore()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      if (hasOnboardingCompleted()) {
        router.push('/chat')
      } else {
        router.push('/onboarding')
      }
    }
  }, [session, status, hasOnboardingCompleted, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Sentient Self</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Sentient Self
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered therapeutic growth platform designed for recovery and personal development
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signup')}
              className="px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/auth/signin')}
              className="px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Conversation-First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Start with natural conversation. Exercises are optional invitations, never obligations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Recovery-Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Designed specifically for addiction recovery with trauma-informed care principles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Crisis-Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Built-in crisis detection with immediate access to professional resources.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Evidence-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                634 therapeutic exercises across 13 frameworks and 25 topics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
              <strong>Important:</strong> Sentient Self is not medical care and does not replace professional mental health treatment. 
              If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}