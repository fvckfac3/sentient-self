'use client'

import { useState } from 'react'
import { OnboardingStep } from './onboarding-step'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIHandoffStepProps {
    onComplete: () => void
    onBack: () => void
}

export function AIHandoffStep({ onComplete, onBack }: AIHandoffStepProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleComplete = async () => {
        setIsLoading(true)
        await onComplete()
        // If onComplete doesn't redirect, we'll stay in loading state
        // This is intentional as onComplete should redirect to /chat
    }

    return (
        <OnboardingStep
            title="You're All Set!"
            description="I'm ready to support you on your journey."
            onNext={handleComplete}
            onBack={onBack}
            nextLabel={isLoading ? 'Starting...' : 'Begin My Journey'}
            isNextDisabled={isLoading}
        >
            <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    {isLoading ? (
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    ) : (
                        <Sparkles className="h-10 w-10 text-primary" />
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        Thank you for sharing a bit about yourself. Based on what you've told me,
                        I'll personalize our conversations to best support your unique journey.
                    </p>
                </div>

                <div className="p-4 bg-accent/50 rounded-lg text-left">
                    <h3 className="font-medium mb-2">A few things to remember:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• <strong>You're in control.</strong> Go at your own pace. There's no pressure.</li>
                        <li>• <strong>Exercises are optional.</strong> I'll never force you to do anything.</li>
                        <li>• <strong>It's okay to pause.</strong> You can take breaks whenever you need.</li>
                        <li>• <strong>I'm here to listen.</strong> Start by sharing whatever's on your mind.</li>
                    </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                    "The journey of a thousand miles begins with a single step."
                </p>
            </div>
        </OnboardingStep>
    )
}
