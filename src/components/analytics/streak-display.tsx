'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, Trophy, Calendar } from 'lucide-react'
import { StreakData } from '@/types/analytics'

interface StreakDisplayProps {
  data: StreakData
}

export function StreakDisplay({ data }: StreakDisplayProps) {
  const { currentStreak, longestStreak, lastActivityDate } = data
  const isActive = currentStreak > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-2 border-orange-500/20 overflow-hidden relative">
        {/* Animated fire background for active streaks */}
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            {/* Current Streak */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={isActive ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`p-4 rounded-2xl ${
                  isActive 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30' 
                    : 'bg-muted'
                }`}
              >
                <Flame className={`h-8 w-8 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
              </motion.div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <motion.p 
                  className="text-4xl font-bold"
                  key={currentStreak}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {currentStreak}
                  <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
                </motion.p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-border" />

            {/* Longest Streak */}
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-yellow-500/10">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
                <p className="text-4xl font-bold">
                  {longestStreak}
                  <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-border" />

            {/* Last Activity */}
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                <p className="text-lg font-medium">
                  {lastActivityDate 
                    ? new Date(lastActivityDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'No activity yet'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Motivational message */}
          {isActive && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              🔥 You're on fire! Keep the momentum going!
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
