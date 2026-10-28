import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LEGAL_LAST_UPDATED, LEGAL_REVIEW_PENDING } from '@/lib/site'

interface LegalPageProps {
  title: string
  children: React.ReactNode
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sentient Self
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

        {LEGAL_REVIEW_PENDING && (
          <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            This document is a draft pending legal review and may change before launch.
          </div>
        )}

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p+p]:mt-3 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
      </div>
    </main>
  )
}
