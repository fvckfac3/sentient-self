'use client'

import { useState } from 'react'
import { OnboardingStep } from './onboarding-step'
import { Check } from 'lucide-react'

interface AddictionContext {
    substances: string[]
    recovery_stage: string
}

interface AddictionContextStepProps {
    addictionContext: AddictionContext
    onUpdate: (context: AddictionContext) => void
    onNext: () => void
    onBack: () => void
}

const SUBSTANCE_OPTIONS = [
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'opioids', label: 'Opioids' },
    { id: 'stimulants', label: 'Stimulants' },
    { id: 'cannabis', label: 'Cannabis' },
    { id: 'benzodiazepines', label: 'Benzodiazepines' },
    { id: 'nicotine', label: 'Nicotine' },
    { id: 'gambling', label: 'Gambling' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'social-media', label: 'Social Media' },
    { id: 'other', label: 'Other' },
    { id: 'none', label: 'Not applicable to me' }
]

const RECOVERY_STAGES = [
    { id: 'active', label: 'Currently using', description: 'Still actively engaging in the behavior' },
    { id: 'considering', label: 'Considering change', description: 'Thinking about making a change' },
    { id: 'early', label: 'Early recovery', description: 'Recently stopped (0-6 months)' },
    { id: 'established', label: 'Established recovery', description: '6 months to 2 years' },
    { id: 'long-term', label: 'Long-term recovery', description: '2+ years' },
    { id: 'na', label: 'Not applicable', description: 'This doesn\'t apply to me' }
]

export function AddictionContextStep({ addictionContext, onUpdate, onNext, onBack }: AddictionContextStepProps) {
    const toggleSubstance = (substanceId: string) => {
        if (substanceId === 'none') {
            onUpdate({ ...addictionContext, substances: ['none'] })
        } else {
            const filtered = addictionContext.substances.filter(s => s !== 'none')
            if (filtered.includes(substanceId)) {
                onUpdate({ ...addictionContext, substances: filtered.filter(s => s !== substanceId) })
            } else {
                onUpdate({ ...addictionContext, substances: [...filtered, substanceId] })
            }
        }
    }

    const selectStage = (stageId: string) => {
        onUpdate({ ...addictionContext, recovery_stage: stageId })
    }

    return (
        <OnboardingStep
            title="Recovery Context"
            description="This information helps me provide more relevant support. Skip if not applicable."
            onNext={onNext}
            onBack={onBack}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium mb-3">What are you dealing with? (optional)</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {SUBSTANCE_OPTIONS.map((option) => {
                            const isSelected = addictionContext.substances.includes(option.id)
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => toggleSubstance(option.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <span className="text-sm">{option.label}</span>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-3">Where are you in your journey? (optional)</h3>
                    <div className="grid gap-2">
                        {RECOVERY_STAGES.map((stage) => {
                            const isSelected = addictionContext.recovery_stage === stage.id
                            return (
                                <button
                                    key={stage.id}
                                    onClick={() => selectStage(stage.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <div>
                                        <span className="text-sm font-medium">{stage.label}</span>
                                        <p className="text-xs text-muted-foreground">{stage.description}</p>
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
