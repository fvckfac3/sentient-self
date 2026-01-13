'use client'

import { useState } from 'react'
import { OnboardingStep } from './onboarding-step'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'

interface ConsentStepProps {
    onNext: () => void
    onBack: () => void
}

export function ConsentStep({ onNext, onBack }: ConsentStepProps) {
    const [consented, setConsented] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleNext = async () => {
        if (!consented) return

        setIsSubmitting(true)
        try {
            // Store disclaimer acknowledgment timestamp
            const response = await fetch('/api/disclaimer/acknowledge', {
                method: 'POST',
            })

            if (response.ok) {
                onNext()
            } else {
                console.error('Failed to acknowledge disclaimer')
            }
        } catch (error) {
            console.error('Error acknowledging disclaimer:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <OnboardingStep
            title="Important Information"
            description="Please read and acknowledge the following before we begin."
            onNext={handleNext}
            onBack={onBack}
            isNextDisabled={!consented || isSubmitting}
            nextLabel={isSubmitting ? "Saving..." : "I Understand & Agree"}
        >
            <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-destructive mb-1">This is Not Medical Care</h3>
                            <p className="text-sm text-muted-foreground">
                                Sentient Self is a personal development tool and is not a substitute for professional
                                mental health treatment, therapy, or medical care. If you're experiencing a mental
                                health emergency, please contact emergency services immediately.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">What I Can Do</h4>
                        <ul className="text-muted-foreground space-y-1">
                            <li>• Provide supportive conversation and reflection</li>
                            <li>• Guide you through therapeutic exercises</li>
                            <li>• Help you explore patterns and insights</li>
                            <li>• Connect you with crisis resources if needed</li>
                        </ul>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">What I Cannot Do</h4>
                        <ul className="text-muted-foreground space-y-1">
                            <li>• Diagnose mental health conditions</li>
                            <li>• Prescribe medication or treatment</li>
                            <li>• Replace a therapist or counselor</li>
                            <li>• Handle medical emergencies</li>
                        </ul>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">Your Privacy</h4>
                        <ul className="text-muted-foreground space-y-1">
                            <li>• Your conversations are private</li>
                            <li>• Your data is never used for AI training</li>
                            <li>• You can export or delete your data anytime</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={() => setConsented(!consented)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${consented
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent/50'
                        }`}
                >
                    <span className="text-sm font-medium">
                        I understand and agree to these terms
                    </span>
                    <div className={`h-5 w-5 rounded border flex items-center justify-center ${consented ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                        {consented && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                </button>
            </div>
        </OnboardingStep>
    )
}
