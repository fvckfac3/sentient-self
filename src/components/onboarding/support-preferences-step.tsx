'use client'

import { OnboardingStep } from './onboarding-step'
import { Check } from 'lucide-react'

interface SupportPreferences {
    tone: string
    exercise_openness: string
}

interface SupportPreferencesStepProps {
    preferences: SupportPreferences
    onUpdate: (preferences: SupportPreferences) => void
    onNext: () => void
    onBack: () => void
}

const TONE_OPTIONS = [
    { id: 'warm', label: 'Warm & Nurturing', description: 'Gentle, compassionate, and supportive' },
    { id: 'direct', label: 'Direct & Practical', description: 'Clear, straightforward, action-oriented' },
    { id: 'balanced', label: 'Balanced', description: 'A mix of warmth and directness' },
    { id: 'challenging', label: 'Challenging & Growth-Focused', description: 'Push me while being supportive' }
]

const EXERCISE_OPTIONS = [
    { id: 'open', label: 'Very Open', description: 'I enjoy structured activities and exercises' },
    { id: 'sometimes', label: 'Sometimes', description: 'I\'m open when it feels right' },
    { id: 'prefer-conversation', label: 'Prefer Conversation', description: 'I mostly want to talk things through' },
    { id: 'rarely', label: 'Rarely', description: 'I usually prefer not to do exercises' }
]

export function SupportPreferencesStep({ preferences, onUpdate, onNext, onBack }: SupportPreferencesStepProps) {
    return (
        <OnboardingStep
            title="How can I best support you?"
            description="These preferences help me personalize my communication style."
            onNext={onNext}
            onBack={onBack}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium mb-3">What tone works best for you?</h3>
                    <div className="grid gap-2">
                        {TONE_OPTIONS.map((option) => {
                            const isSelected = preferences.tone === option.id
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onUpdate({ ...preferences, tone: option.id })}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <div>
                                        <span className="text-sm font-medium">{option.label}</span>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-3">How do you feel about guided exercises?</h3>
                    <div className="grid gap-2">
                        {EXERCISE_OPTIONS.map((option) => {
                            const isSelected = preferences.exercise_openness === option.id
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onUpdate({ ...preferences, exercise_openness: option.id })}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <div>
                                        <span className="text-sm font-medium">{option.label}</span>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </OnboardingStep>
    )
}
