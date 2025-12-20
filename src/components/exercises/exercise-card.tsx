'use client'

import { Exercise } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Target, Sparkles } from 'lucide-react'

interface ExerciseCardProps {
    exercise: Exercise
    onStart?: (exercise: Exercise) => void
    isLoading?: boolean
}

export function ExerciseCard({ exercise, onStart, isLoading }: ExerciseCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{exercise.title}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {exercise.framework}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{exercise.topic}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>5-10 min</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.aspect}
                </p>

                {onStart && (
                    <Button
                        className="w-full"
                        onClick={() => onStart(exercise)}
                        disabled={isLoading}
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Exercise
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
