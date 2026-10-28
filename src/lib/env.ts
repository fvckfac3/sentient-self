/**
 * Environment Variable Validation
 * Uses Zod to validate environment variables when the server starts
 * (called from src/instrumentation.ts). Problems are logged, not thrown, so a
 * missing optional integration doesn't take the whole app down.
 *
 * Keep in sync with .env.example.
 */

import { z } from 'zod'

const optional = z.string().min(1).optional()

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),

    // Auth
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),

    // OAuth Providers (optional)
    GOOGLE_CLIENT_ID: optional,
    GOOGLE_CLIENT_SECRET: optional,
    APPLE_ID: optional,
    APPLE_SECRET: optional,

    // Stripe (required for billing)
    STRIPE_SECRET_KEY: optional,
    STRIPE_WEBHOOK_SECRET: optional,
    STRIPE_PREMIUM_PRICE_ID: optional,
    STRIPE_INSTITUTION_PRICE_ID: optional,

    // AI API Keys - names are the ones the AI SDK providers read
    DEEPSEEK_API_KEY: optional,
    OPENAI_API_KEY: optional,
    ANTHROPIC_API_KEY: optional,
    GOOGLE_GENERATIVE_AI_API_KEY: optional,

    // Rate limiting (optional; in-memory fallback otherwise)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: optional,

    // Error monitoring (optional)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Site
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): void {
    // Treat empty strings as unset
    const values = Object.fromEntries(
        Object.entries(process.env).filter(([, value]) => value !== '')
    )

    const parsed = envSchema.safeParse(values)
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
        return
    }

    const env = parsed.data

    // The free tier, insights and journal analysis all use DeepSeek
    if (!env.DEEPSEEK_API_KEY) {
        console.error('❌ DEEPSEEK_API_KEY is not set. Chat and insights will not work.')
    }

    const premiumKeys = [env.ANTHROPIC_API_KEY, env.OPENAI_API_KEY, env.GOOGLE_GENERATIVE_AI_API_KEY]
    if (!premiumKeys.some(Boolean)) {
        console.warn('⚠️ No premium AI provider key is set; premium models will fail.')
    }

    const stripeKeys = [env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET, env.STRIPE_PREMIUM_PRICE_ID]
    if (stripeKeys.some(Boolean) && !stripeKeys.every(Boolean)) {
        console.warn('⚠️ Stripe is partly configured: set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and STRIPE_PREMIUM_PRICE_ID.')
    }

    if (process.env.NODE_ENV === 'production' && !env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
        console.warn('⚠️ No Redis configured; rate limits are per server instance only.')
    }
}
