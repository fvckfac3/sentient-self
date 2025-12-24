"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export function useDisclaimer() {
  const { data: session, status } = useSession()
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAcknowledging, setIsAcknowledging] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      checkDisclaimer()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [status])

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
