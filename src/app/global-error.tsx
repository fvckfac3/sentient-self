'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Please try again. If you are in crisis, call or text 988 (US) or your local emergency number.
        </p>
        <button
          onClick={() => reset()}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
