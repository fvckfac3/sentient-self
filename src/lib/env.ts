/**
 * Environment Variable Validation
 * Uses Zod to validate required environment variables at startup
 */

import { z } from 'zod'

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),

    // Auth
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),

    // OAuth Providers (optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    APPLE_ID: z.string().optional(),
    APPLE_TEAM_ID: z.string().optional(),
    APPLE_PRIVATE_KEY: z.string().optional(),
    APPLE_KEY_ID: z.string().optional(),

    // Stripe (optional for development)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // AI API Keys (at least one required)
    DEEPSEEK_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    GROK_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:')
        console.error(parsed.error.flatten().fieldErrors)
        throw new Error('Invalid environment variables')
    }

    // Ensure at least one AI API key is provided
    const aiKeys = [
        parsed.data.DEEPSEEK_API_KEY,
        parsed.data.OPENAI_API_KEY,
        parsed.data.ANTHROPIC_API_KEY,
        parsed.data.GOOGLE_AI_API_KEY,
        parsed.data.GROK_API_KEY
    ].filter(Boolean)

    if (aiKeys.length === 0) {
        console.warn('⚠️ No AI API keys configured. AI features will not work.')
    }

    return parsed.data
}

// Validate on import (only in Node.js environment)
let env: Env

try {
    if (typeof process !== 'undefined' && process.env) {
        env = validateEnv()
    }
} catch (error) {
    // Allow build to proceed even if validation fails
    console.warn('Environment validation skipped during build')
    env = process.env as unknown as Env
}

export { env }
