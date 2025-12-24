"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Shield, Phone, Heart } from "lucide-react"

interface MedicalDisclaimerProps {
  onAcknowledge: () => void
  isLoading?: boolean
  isCrisisMode?: boolean
}

export function MedicalDisclaimer({ 
  onAcknowledge, 
  isLoading = false,
  isCrisisMode = false 
}: MedicalDisclaimerProps) {
  const [hasRead, setHasRead] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  const canProceed = hasRead && hasAcknowledged

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-2xl">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                {isCrisisMode ? (
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {isCrisisMode ? "Important Safety Information" : "Important Health Information"}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Crisis Mode Additional Warning */}
              {isCrisisMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">
                        If you're in immediate danger, please contact:
                      </p>
                      <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                        <li><strong>Emergency:</strong> 911</li>
                        <li><strong>Suicide & Crisis Lifeline:</strong> 988</li>
                        <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Disclaimer Content */}
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        This is Not Medical Care
                      </h3>
                      <p className="text-sm">
                        Sentient Self is a supportive tool designed to complement—not replace—professional 
                        mental health care. Our AI companion and exercises are educational and supportive 
                        in nature, not medical treatment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Not a Substitute for Professional Help
                      </h3>
                      <p className="text-sm">
                        If you are experiencing a mental health crisis, suicidal thoughts, or 
                        substance abuse emergency, please contact a mental health professional, 
                        call 988 (Suicide & Crisis Lifeline), or go to your nearest emergency room.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Your Safety is Our Priority
                      </h3>
                      <p className="text-sm">
                        While we strive to provide helpful support, we cannot guarantee outcomes. 
                        The effectiveness of self-help exercises varies by individual. Always 
                        prioritize your safety and consult healthcare providers for medical decisions.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      By using Sentient Self, you understand that:
                    </h3>
                    <ul className="text-sm space-y-2 list-disc list-inside">
                      <li>This app provides supportive tools, not medical advice or treatment</li>
                      <li>AI responses are not from licensed healthcare professionals</li>
                      <li>You should not delay seeking professional help based on app interactions</li>
                      <li>In emergencies, you will contact appropriate crisis services</li>
                      <li>Your use of this app is at your own discretion and risk</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>

              {/* Acknowledgment Checkboxes */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={hasRead}
                    onCheckedChange={(checked) => setHasRead(checked === true)}
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    I have read and understand the information above
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={hasAcknowledged}
                    onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    I acknowledge that Sentient Self is not a substitute for professional 
                    mental health care, and I will seek appropriate help if I am in crisis
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <Button
                onClick={onAcknowledge}
                disabled={!canProceed || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 min-h-[48px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing...
                  </span>
                ) : (
                  "I Understand and Agree to Continue"
                )}
              </Button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                This acknowledgment will be recorded for your safety and our records.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
