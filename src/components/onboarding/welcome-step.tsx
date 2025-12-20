'use client'

import { OnboardingStep } from './onboarding-step'
import { Heart, Shield, Brain } from 'lucide-react'

interface WelcomeStepProps {
    onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <OnboardingStep
            title="Welcome to Sentient Self"
            description="Your AI-powered companion for personal growth and healing"
            onNext={onNext}
            showBack={false}
            nextLabel="Get Started"
        >
            <div className="space-y-6">
                <p className="text-muted-foreground">
                    Before we begin, I'd like to learn a bit about you so I can personalize
                    your experience. This will take about 2-3 minutes.
                </p>

                <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                        <Brain className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h3 className="font-medium">Conversation-First</h3>
                            <p className="text-sm text-muted-foreground">
                                Start with natural conversation. Exercises are always optional.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                        <Heart className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h3 className="font-medium">Trauma-Informed</h3>
                            <p className="text-sm text-muted-foreground">
                                Your pace, your choice. I'll never push you beyond what feels safe.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h3 className="font-medium">Safe & Private</h3>
                            <p className="text-sm text-muted-foreground">
                                Built-in crisis support. Your data is never used for AI training.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingStep>
    )
}
