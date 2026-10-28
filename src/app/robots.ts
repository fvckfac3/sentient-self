import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/terms', '/auth/signin', '/auth/signup'],
      disallow: ['/api/', '/chat', '/journal', '/progress', '/analytics', '/settings', '/onboarding'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
