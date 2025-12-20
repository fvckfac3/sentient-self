'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { OnboardingStep } from '@/components/onboarding/onboarding-step'
import { WelcomeStep } from '@/components/onboarding/welcome-step'
import { IntentStep } from '@/components/onboarding/intent-step'
import { ChallengesStep } from '@/components/onboarding/challenges-step'
import { AddictionContextStep } from '@/components/onboarding/addiction-context-step'
import { EmotionalBaselineStep } from '@/components/onboarding/emotional-baseline-step'
import { SupportPreferencesStep } from '@/components/onboarding/support-preferences-step'
import { ConsentStep } from '@/components/onboarding/consent-step'
import { AIHandoffStep } from '@/components/onboarding/ai-handoff-step'
import { UserBaselineProfile } from '@/types'

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [baselineProfile, setBaselineProfile] = useState<Partial<UserBaselineProfile>>({
    primary_intents: [],
    current_challenges: [],
    addiction_context: {
      substances: [],
      recovery_stage: ''
    },
    emotional_baseline: [],
    support_preferences: {
      tone: '',
      exercise_openness: ''
    }
  })

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const updateProfile = (updates: Partial<UserBaselineProfile>) => {
    setBaselineProfile(prev => ({
      ...prev,
      ...updates,
      addiction_context: {
        substances: prev.addiction_context?.substances ?? [],
        recovery_stage: prev.addiction_context?.recovery_stage ?? '',
        ...updates.addiction_context
      },
      support_preferences: {
        tone: prev.support_preferences?.tone ?? '',
        exercise_openness: prev.support_preferences?.exercise_openness ?? '',
        ...updates.support_preferences
      }
    }))
  }

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baselineProfile)
      })

      if (response.ok) {
        router.push('/chat')
      } else {
        console.error('Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} />
      case 2:
        return (
          <IntentStep
            intents={baselineProfile.primary_intents || []}
            onUpdate={(intents) => updateProfile({ primary_intents: intents })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <ChallengesStep
            challenges={baselineProfile.current_challenges || []}
            onUpdate={(challenges) => updateProfile({ current_challenges: challenges })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <AddictionContextStep
            addictionContext={baselineProfile.addiction_context!}
            onUpdate={(context) => updateProfile({ addiction_context: context })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <EmotionalBaselineStep
            emotions={baselineProfile.emotional_baseline || []}
            onUpdate={(emotions) => updateProfile({ emotional_baseline: emotions })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 6:
        return (
          <SupportPreferencesStep
            preferences={baselineProfile.support_preferences!}
            onUpdate={(prefs) => updateProfile({ support_preferences: prefs })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 7:
        return (
          <ConsentStep
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 8:
        return (
          <AIHandoffStep
            onComplete={completeOnboarding}
            onBack={prevStep}
          />
        )
      default:
        return <WelcomeStep onNext={nextStep} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}