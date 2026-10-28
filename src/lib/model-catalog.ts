/**
 * Model catalog - client-safe metadata and tier rules.
 *
 * This file must not import any provider SDKs so it can be used from client
 * components. Provider instances live in `models.ts` (server only).
 */

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'INSTITUTION'

export interface ModelInfo {
  provider: 'DeepSeek' | 'OpenAI' | 'Anthropic' | 'Google'
  /** Model ID sent to the provider's API */
  apiModelId: string
  name: string
  description: string
  tier: 'FREE' | 'PREMIUM'
  /** Rough blended cost per 1K tokens (USD), for display only */
  costPer1kTokens: number
  bestFor?: string
}

export const MODEL_CATALOG = {
  // ============================================
  // FREE TIER MODELS (Available to all users)
  // ============================================

  'deepseek-flash': {
    provider: 'DeepSeek',
    apiModelId: 'deepseek-flash',
    name: 'DeepSeek Flash',
    description: '⭐ Free tier - Excellent performance at minimal cost',
    tier: 'FREE',
    costPer1kTokens: 0.0003,
    bestFor: 'General conversations, all exercises - Best value!'
  },

  'gemini-3.5-flash-lite': {
    provider: 'Google',
    apiModelId: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    description: 'Lightning fast with a huge context window',
    tier: 'FREE',
    costPer1kTokens: 0.0003,
    bestFor: 'Long conversations, journaling analysis'
  },

  // ============================================
  // PREMIUM MODELS (Require subscription)
  // ============================================

  // Anthropic Claude (Best for therapeutic work)
  'claude-opus-5-5': {
    provider: 'Anthropic',
    apiModelId: 'claude-opus-5-5',
    name: 'Claude Opus 5.5',
    description: '⭐ Best for therapeutic conversations - empathetic & nuanced',
    tier: 'PREMIUM',
    costPer1kTokens: 0.012,
    bestFor: 'Therapeutic exercises, emotional support, trauma work'
  },

  'claude-sonnet-5-5': {
    provider: 'Anthropic',
    apiModelId: 'claude-sonnet-5-5',
    name: 'Claude Sonnet 5.5',
    description: 'Fast, capable Claude model with great quality',
    tier: 'PREMIUM',
    costPer1kTokens: 0.006,
    bestFor: 'Everyday check-ins, structured exercises'
  },

  'claude-haiku-5-5': {
    provider: 'Anthropic',
    apiModelId: 'claude-haiku-5-5',
    name: 'Claude Haiku 5.5',
    description: 'Fastest Claude model',
    tier: 'PREMIUM',
    costPer1kTokens: 0.0003,
    bestFor: 'Quick therapeutic check-ins'
  },

  // OpenAI
  'gpt-6.1-sol': {
    provider: 'OpenAI',
    apiModelId: 'gpt-6.1-sol',
    name: 'GPT-6.1 Sol',
    description: 'Highly capable OpenAI model, excellent reasoning',
    tier: 'PREMIUM',
    costPer1kTokens: 0.006,
    bestFor: 'Complex exercises, deep analysis'
  },

  'gpt-6.1-terra': {
    provider: 'OpenAI',
    apiModelId: 'gpt-6.1-terra',
    name: 'GPT-6.1 Terra',
    description: 'Fast and efficient, natural writing',
    tier: 'PREMIUM',
    costPer1kTokens: 0.003,
    bestFor: 'Structured exercises, frameworks'
  },

  // Google Gemini
  'gemini-3.8-flash': {
    provider: 'Google',
    apiModelId: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Latest stable Gemini Flash - fast with a huge context window',
    tier: 'PREMIUM',
    costPer1kTokens: 0.001,
    bestFor: 'Long therapeutic sessions, comprehensive analysis'
  },
} as const satisfies Record<string, ModelInfo>

export type ModelId = keyof typeof MODEL_CATALOG

export const DEFAULT_FREE_MODEL: ModelId = 'deepseek-flash'
export const DEFAULT_PREMIUM_MODEL: ModelId = 'claude-opus-5-5'

export function isModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MODEL_CATALOG, value)
}

export function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  return tier === 'PREMIUM' || tier === 'INSTITUTION' ? tier : 'FREE'
}

export function canUseModel(modelId: ModelId, tier: string | null | undefined): boolean {
  return MODEL_CATALOG[modelId].tier === 'FREE' || normalizeTier(tier) !== 'FREE'
}

export function getDefaultModelForTier(tier: string | null | undefined): ModelId {
  return normalizeTier(tier) === 'FREE' ? DEFAULT_FREE_MODEL : DEFAULT_PREMIUM_MODEL
}

/**
 * Pick the model to use for a request. Untrusted or stale values (an unknown
 * ID, or a premium model on a free account) fall through to the next choice.
 */
export function resolveModelId(
  candidates: Array<string | null | undefined>,
  tier: string | null | undefined
): ModelId {
  for (const candidate of candidates) {
    if (isModelId(candidate) && canUseModel(candidate, tier)) {
      return candidate
    }
  }
  return getDefaultModelForTier(tier)
}

export function getModelsForTier(tier: string | null | undefined): ModelId[] {
  return (Object.keys(MODEL_CATALOG) as ModelId[]).filter(id => canUseModel(id, tier))
}
