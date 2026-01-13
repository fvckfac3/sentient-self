import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sentient Self - AI-Powered Therapeutic Growth Platform',
  description: 'Conversation-first, AI-guided therapeutic self-development platform designed for recovering addicts and individuals seeking deep personal growth.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS viewport height fix */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function setVH() {
                let vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              }
              setVH();
              window.addEventListener('resize', setVH);
              window.addEventListener('orientationchange', setVH);
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="has-bottom-nav md:pb-0">
            {children}
          </div>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  )
}
