'use client'

import { useState } from 'react'
import { OnboardingStep } from './onboarding-step'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface IntentStepProps {
    intents: string[]
    onUpdate: (intents: string[]) => void
    onNext: () => void
    onBack: () => void
}

const INTENT_OPTIONS = [
    { id: 'personal-growth', label: 'Personal Growth', description: 'Self-improvement and development' },
    { id: 'addiction-recovery', label: 'Addiction Recovery', description: 'Support for substance or behavioral recovery' },
    { id: 'anxiety-management', label: 'Anxiety Management', description: 'Coping with worry and stress' },
    { id: 'depression-support', label: 'Depression Support', description: 'Managing low mood and motivation' },
    { id: 'relationship-healing', label: 'Relationship Healing', description: 'Improving connections with others' },
    { id: 'trauma-processing', label: 'Trauma Processing', description: 'Working through difficult experiences' },
    { id: 'self-discovery', label: 'Self-Discovery', description: 'Understanding who you are' },
    { id: 'purpose-meaning', label: 'Purpose & Meaning', description: 'Finding direction in life' }
]

export function IntentStep({ intents, onUpdate, onNext, onBack }: IntentStepProps) {
    const toggleIntent = (intentId: string) => {
        if (intents.includes(intentId)) {
            onUpdate(intents.filter(i => i !== intentId))
        } else {
            onUpdate([...intents, intentId])
        }
    }

    return (
        <OnboardingStep
            title="What brings you here?"
            description="Select all that apply. This helps me understand how to best support you."
            onNext={onNext}
            onBack={onBack}
            isNextDisabled={intents.length === 0}
        >
            <div className="grid gap-2">
                {INTENT_OPTIONS.map((option) => {
                    const isSelected = intents.includes(option.id)
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggleIntent(option.id)}
                            className={`flex items-center justify-between p-4 rounded-lg border text-left transition-colors ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:bg-accent/50'
                                }`}
                        >
                            <div>
                                <h3 className="font-medium">{option.label}</h3>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                            {isSelected && <Check className="h-5 w-5 text-primary" />}
                        </button>
                    )
                })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
                You can change these preferences anytime in your settings.
            </p>
        </OnboardingStep>
    )
}
