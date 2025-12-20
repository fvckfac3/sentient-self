'use client'

import { OnboardingStep } from './onboarding-step'
import { Check } from 'lucide-react'

interface EmotionalBaselineStepProps {
    emotions: string[]
    onUpdate: (emotions: string[]) => void
    onNext: () => void
    onBack: () => void
}

const EMOTION_OPTIONS = [
    { id: 'calm', label: 'Calm', emoji: '😌' },
    { id: 'anxious', label: 'Anxious', emoji: '😰' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'hopeful', label: 'Hopeful', emoji: '🌟' },
    { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { id: 'numb', label: 'Numb', emoji: '😐' },
    { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵' },
    { id: 'motivated', label: 'Motivated', emoji: '💪' },
    { id: 'lonely', label: 'Lonely', emoji: '🥺' },
    { id: 'grateful', label: 'Grateful', emoji: '🙏' },
    { id: 'angry', label: 'Angry', emoji: '😠' },
    { id: 'peaceful', label: 'Peaceful', emoji: '☮️' }
]

export function EmotionalBaselineStep({ emotions, onUpdate, onNext, onBack }: EmotionalBaselineStepProps) {
    const toggleEmotion = (emotionId: string) => {
        if (emotions.includes(emotionId)) {
            onUpdate(emotions.filter(e => e !== emotionId))
        } else {
            onUpdate([...emotions, emotionId])
        }
    }

    return (
        <OnboardingStep
            title="How are you feeling right now?"
            description="Select any emotions that resonate with you in this moment."
            onNext={onNext}
            onBack={onBack}
        >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {EMOTION_OPTIONS.map((option) => {
                    const isSelected = emotions.includes(option.id)
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggleEmotion(option.id)}
                            className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:bg-accent/50'
                                }`}
                        >
                            <span className="text-2xl mb-1">{option.emoji}</span>
                            <span className="text-xs font-medium">{option.label}</span>
                        </button>
                    )
                })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
                There are no right or wrong answers. All feelings are valid.
            </p>
        </OnboardingStep>
    )
}
