'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Phone, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CrisisBannerProps {
  isVisible: boolean
  onDismiss?: () => void
}

export function CrisisBanner({ isVisible, onDismiss }: CrisisBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 right-0 z-50 p-4"
        >
          <Card className="max-w-2xl mx-auto bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-lg">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    You're Not Alone - Help is Available
                  </h3>
                  
                  <div className="space-y-3">
                    {/* 988 Lifeline */}
                    <a 
                      href="tel:988"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          988 Suicide & Crisis Lifeline
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Call or text 988 • Available 24/7
                        </p>
                      </div>
                    </a>
                    
                    {/* Crisis Text Line */}
                    <a 
                      href="sms:741741&body=HOME"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          Crisis Text Line
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Text HOME to 741741
                        </p>
                      </div>
                    </a>
                    
                    {/* 911 */}
                    <a 
                      href="tel:911"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          Emergency Services
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Call 911 if in immediate danger
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
                
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDismiss}
                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
