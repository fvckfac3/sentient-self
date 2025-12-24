'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
  delay?: number
}

const colorVariants = {
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    icon: 'bg-blue-500/10 text-blue-500',
    border: 'border-blue-500/20'
  },
  green: {
    bg: 'from-green-500/10 to-green-600/5',
    icon: 'bg-green-500/10 text-green-500',
    border: 'border-green-500/20'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    icon: 'bg-purple-500/10 text-purple-500',
    border: 'border-purple-500/20'
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-600/5',
    icon: 'bg-orange-500/10 text-orange-500',
    border: 'border-orange-500/20'
  },
  pink: {
    bg: 'from-pink-500/10 to-pink-600/5',
    icon: 'bg-pink-500/10 text-pink-500',
    border: 'border-pink-500/20'
  }
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue',
  delay = 0 
}: StatCardProps) {
  const colors = colorVariants[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      <Card className={cn(
        'relative overflow-hidden border-2 transition-shadow duration-300',
        'hover:shadow-lg hover:shadow-primary/5',
        colors.border
      )}>
        {/* Gradient background */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          colors.bg
        )} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <motion.p 
                className="text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.3 }}
                  className={cn(
                    'inline-flex items-center text-xs font-medium',
                    trend.isPositive ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  <span className="ml-1 text-muted-foreground">vs last week</span>
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.1, type: 'spring', stiffness: 150 }}
              className={cn('p-3 rounded-xl', colors.icon)}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
