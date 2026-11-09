"use client"

import { createContext, useContext, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useDisclaimer } from "@/hooks/use-disclaimer"
import { MedicalDisclaimer } from "@/components/legal/medical-disclaimer"

interface DisclaimerContextType {
  hasAcknowledged: boolean | null
  showCrisisDisclaimer: () => void
}

const DisclaimerContext = createContext<DisclaimerContextType>({
  hasAcknowledged: null,
  showCrisisDisclaimer: () => {},
})

export function useDisclaimerContext() {
  return useContext(DisclaimerContext)
}

interface DisclaimerProviderProps {
  children: ReactNode
}

export function DisclaimerProvider({ children }: DisclaimerProviderProps) {
  const { 
    hasAcknowledged, 
    isLoading, 
    isAcknowledging, 
    acknowledge, 
    needsDisclaimer 
  } = useDisclaimer()
  const pathname = usePathname()

  // Onboarding has its own consent step; legal pages must stay readable
  const suppressed = ['/onboarding', '/privacy', '/terms', '/auth'].some(p => pathname.startsWith(p))

  const handleAcknowledge = async () => {
    await acknowledge()
  }

  // Don't block while loading
  if (isLoading) {
    return <>{children}</>
  }

  return (
    <DisclaimerContext.Provider 
      value={{ 
        hasAcknowledged, 
        showCrisisDisclaimer: () => {} // Implement if needed for crisis mode
      }}
    >
      {needsDisclaimer && !suppressed && (
        <MedicalDisclaimer
          onAcknowledge={handleAcknowledge}
          isLoading={isAcknowledging}
        />
      )}
      {children}
    </DisclaimerContext.Provider>
  )
}
