'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles } from 'lucide-react'

interface ExerciseCardAnimatedProps {
  id: string
  title: string
  framework: string
  description: string
  onStart: (id: string) => void
}

export function ExerciseCardAnimated({ id, title, framework, description, onStart }: ExerciseCardAnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="mb-6 max-w-[80%]"
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <Badge variant="outline" className="bg-primary/10 border-primary/30">
              {framework}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
          
          <motion.div
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onStart(id)}
              className="w-full group"
              size="lg"
            >
              <span>Start Exercise</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
