'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FrameworkEffectiveness as FrameworkEffectivenessType } from '@/types/analytics'
import { Layers, Sparkles } from 'lucide-react'

interface FrameworkEffectivenessProps {
  data: FrameworkEffectivenessType[]
}

const frameworkColors: Record<string, string> = {
  'trauma-alchemy': 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'cbt': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'dbt': 'from-green-500/20 to-green-600/10 border-green-500/30',
  'act': 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'shadow-work': 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
  'default': 'from-primary/20 to-primary/10 border-primary/30',
}

function getFrameworkColor(frameworkId: string): string {
  for (const key of Object.keys(frameworkColors)) {
    if (frameworkId.toLowerCase().includes(key)) {
      return frameworkColors[key]
    }
  }
  return frameworkColors['default']
}

export function FrameworkEffectiveness({ data }: FrameworkEffectivenessProps) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-2 border-dashed border-muted">
          <CardContent className="p-8 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Complete some exercises to see which frameworks work best for you!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Find max for relative sizing
  const maxExercises = Math.max(...data.map(f => f.exercisesCompleted))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="border-2 border-purple-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <CardTitle>Framework Usage</CardTitle>
          </div>
          <CardDescription>
            Therapeutic frameworks you've engaged with most
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-3">
          {data.slice(0, 5).map((framework, index) => {
            const percentage = (framework.exercisesCompleted / maxExercises) * 100
            const colorClass = getFrameworkColor(framework.frameworkId)

            return (
              <motion.div
                key={framework.frameworkId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={`p-4 rounded-xl bg-gradient-to-r border-2 ${colorClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                      </motion.div>
                    )}
                    <span className="font-medium">{framework.frameworkName}</span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Most Used
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-bold">
                    {framework.exercisesCompleted} exercises
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground/20"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
