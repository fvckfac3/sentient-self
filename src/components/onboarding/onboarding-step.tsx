'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface OnboardingStepProps {
  title: string
  description?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  showBack?: boolean
  nextLabel?: string
  backLabel?: string
  isNextDisabled?: boolean
}

export function OnboardingStep({
  title,
  description,
  children,
  onNext,
  onBack,
  showBack = true,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isNextDisabled = false
}: OnboardingStepProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && (
          <CardDescription className="text-base">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        
        <div className="flex justify-between pt-4">
          {showBack && onBack ? (
            <Button variant="outline" onClick={onBack}>
              {backLabel}
            </Button>
          ) : (
            <div />
          )}
          {onNext && (
            <Button onClick={onNext} disabled={isNextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
