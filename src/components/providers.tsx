'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '@/components/providers/toast-provider'
import { DisclaimerProvider } from '@/components/providers/disclaimer-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <DisclaimerProvider>
          {children}
          <Toaster />
          <ToastProvider />
        </DisclaimerProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}