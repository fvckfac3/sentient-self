/**
 * Site-wide constants used by legal pages, metadata and footers.
 * Set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_SUPPORT_EMAIL per environment.
 */

export const SITE_NAME = 'Sentient Self'

export const SITE_DESCRIPTION =
  'AI journaling and guided conversation that learns your patterns and reflects your growth. Built for people in recovery and anyone doing deep personal work.'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@sentientself.com'

/**
 * Legal pages show a "draft" notice until a lawyer has reviewed them.
 * Flip to false once the Privacy Policy and Terms have been approved.
 */
export const LEGAL_REVIEW_PENDING = true

/** Date shown as "Last updated" on the legal pages */
export const LEGAL_LAST_UPDATED = 'October 28, 2026'
