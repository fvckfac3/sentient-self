"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function useDisclaimer() {
  const { status } = useSession()
  const pathname = usePathname()
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAcknowledging, setIsAcknowledging] = useState(false)

  // Re-check on navigation until acknowledged: onboarding's consent step
  // acknowledges through the API, not through this hook
  useEffect(() => {
    if (status === "authenticated" && hasAcknowledged !== true) {
      checkDisclaimer()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pathname])

  const checkDisclaimer = async () => {
    try {
      const response = await fetch("/api/disclaimer/acknowledge")
      if (response.ok) {
        const data = await response.json()
        setHasAcknowledged(data.acknowledged)
      }
    } catch (error) {
      console.error("Error checking disclaimer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const acknowledge = useCallback(async () => {
    setIsAcknowledging(true)
    try {
      const response = await fetch("/api/disclaimer/acknowledge", {
        method: "POST",
      })
      if (response.ok) {
        setHasAcknowledged(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error acknowledging disclaimer:", error)
      return false
    } finally {
      setIsAcknowledging(false)
    }
  }, [])

  return {
    hasAcknowledged,
    isLoading,
    isAcknowledging,
    acknowledge,
    needsDisclaimer: hasAcknowledged === false,
  }
}
