'use client'

import { OnboardingStep } from './onboarding-step'
import { Check } from 'lucide-react'

interface ChallengesStepProps {
    challenges: string[]
    onUpdate: (challenges: string[]) => void
    onNext: () => void
    onBack: () => void
}

const CHALLENGE_OPTIONS = [
    { id: 'stress', label: 'Overwhelming stress' },
    { id: 'anxiety', label: 'Persistent anxiety or worry' },
    { id: 'depression', label: 'Low mood or depression' },
    { id: 'relationships', label: 'Relationship difficulties' },
    { id: 'self-esteem', label: 'Low self-worth or confidence' },
    { id: 'anger', label: 'Anger or emotional regulation' },
    { id: 'grief', label: 'Grief or loss' },
    { id: 'trauma', label: 'Unprocessed trauma' },
    { id: 'addiction', label: 'Addiction or compulsive behaviors' },
    { id: 'loneliness', label: 'Loneliness or isolation' },
    { id: 'purpose', label: 'Lack of purpose or direction' },
    { id: 'sleep', label: 'Sleep difficulties' }
]

export function ChallengesStep({ challenges, onUpdate, onNext, onBack }: ChallengesStepProps) {
    const toggleChallenge = (challengeId: string) => {
        if (challenges.includes(challengeId)) {
            onUpdate(challenges.filter(c => c !== challengeId))
        } else {
            onUpdate([...challenges, challengeId])
        }
    }

    return (
        <OnboardingStep
            title="What are you struggling with?"
            description="Select any current challenges. This is completely confidential."
            onNext={onNext}
            onBack={onBack}
        >
            <div className="grid sm:grid-cols-2 gap-2">
                {CHALLENGE_OPTIONS.map((option) => {
                    const isSelected = challenges.includes(option.id)
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggleChallenge(option.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:bg-accent/50'
                                }`}
                        >
                            <span className="text-sm font-medium">{option.label}</span>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                    )
                })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
                It's okay if you're not sure. We can explore this together.
            </p>
        </OnboardingStep>
    )
}
