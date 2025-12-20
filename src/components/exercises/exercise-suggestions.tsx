'use client'

import { Exercise } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Target } from 'lucide-react'

interface ExerciseSuggestionsProps {
  exercises: Exercise[]
  onResponse: (response: 'accept' | 'decline' | 'custom', exerciseId?: string) => void
}

export function ExerciseSuggestions({ exercises, onResponse }: ExerciseSuggestionsProps) {
  return (
    <div className="space-y-4 p-4 bg-accent/50 rounded-lg border border-border">
      <div className="text-center">
        <h3 className="font-medium text-foreground mb-2">Therapeutic Exercise Suggestions</h3>
        <p className="text-sm text-muted-foreground">
          Based on our conversation, here are some structured exercises that might help:
        </p>
      </div>

      <div className="grid gap-3">
        {exercises.slice(0, 3).map((exercise) => (
          <Card key={exercise.id} className="cursor-pointer hover:bg-accent/80 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {exercise.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {exercise.framework} • {exercise.topic}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <BookOpen className="w-3 h-3" />
                  <span>{exercise.framework}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{exercise.aspect}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>10-15 min</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => onResponse('accept', exercise.id)}
              >
                Try this exercise
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onResponse('custom')}
        >
          Request custom exercise
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onResponse('decline')}
        >
          Continue talking instead
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Remember: exercises are optional invitations. Choose what feels right for you.
      </p>
    </div>
  )
}