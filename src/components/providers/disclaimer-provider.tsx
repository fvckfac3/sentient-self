"use client"

import { createContext, useContext, ReactNode } from "react"
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
      {needsDisclaimer && (
        <MedicalDisclaimer
          onAcknowledge={handleAcknowledge}
          isLoading={isAcknowledging}
        />
      )}
      {children}
    </DisclaimerContext.Provider>
  )
}
