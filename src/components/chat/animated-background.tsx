'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function AnimatedBackground() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs - adjust opacity based on theme */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
        }`}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
        }`}
      />
    </div>
  )
}
