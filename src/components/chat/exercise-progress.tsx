'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, CheckCircle2 } from 'lucide-react'

interface ExerciseProgressProps {
  exerciseTitle: string
  frameworkName: string
  currentPhase: number
  totalPhases: number
  phaseName: string
  onCancel: () => void
}

export function ExerciseProgress({
  exerciseTitle,
  frameworkName,
  currentPhase,
  totalPhases,
  phaseName,
  onCancel
}: ExerciseProgressProps) {
  const progress = ((currentPhase + 1) / totalPhases) * 100

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="border-b bg-primary/5 px-4 py-3"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10">
              {frameworkName}
            </Badge>
            <span className="font-medium text-sm">{exerciseTitle}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Exit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Phase {currentPhase + 1}/{totalPhases}: {phaseName}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
