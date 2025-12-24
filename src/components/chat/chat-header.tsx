'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface ChatHeaderProps {
  modelName: string
  userName?: string
  state?: string
  onSettingsClick: () => void
}

export function ChatHeader({ modelName, userName, state, onSettingsClick }: ChatHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-2xl">🌱</div>
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold">Sentient Self</h1>
            <p className="text-xs text-muted-foreground">
              {state === 'CRISIS_MODE' ? 'Crisis Support Mode' : 
               state === 'EXERCISE_FACILITATION' ? 'Exercise in Progress' :
               'Your therapeutic companion'}
            </p>
          </div>
        </div>

        {/* Right: Model + Theme + Settings */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge 
              variant="outline" 
              className="bg-primary/10 border-primary/30 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {modelName}
            </Badge>
          </motion.div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {userName && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  )
}
