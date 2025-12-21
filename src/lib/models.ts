/**
 * Model Registry for Vercel AI SDK Multi-Model Support
 * Supports 100+ models across multiple providers
 */

import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

// DeepSeek provider (OpenAI-compatible API)
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export interface ModelConfig {
  provider: string
  model: any
  name: string
  description: string
  tier: 'FREE' | 'PREMIUM'
  costPer1kTokens: number
  bestFor?: string
}

export const modelRegistry: Record<string, ModelConfig> = {
  // ============================================
  // FREE TIER MODELS (Available to all users)
  // ============================================
  
  'deepseek-chat': {
    provider: 'DeepSeek',
    model: deepseek('deepseek-chat'),
    name: 'DeepSeek Chat',
    description: '⭐ Free tier - Excellent performance at minimal cost',
    tier: 'FREE',
    costPer1kTokens: 0.00014,
    bestFor: 'General conversations, all exercises - Best value!'
  },
  
  'gemini-1.5-flash': {
    provider: 'Google',
    model: google('gemini-1.5-flash-latest'),
    name: 'Gemini 1.5 Flash',
    description: 'Lightning fast with huge context window',
    tier: 'FREE',
    costPer1kTokens: 0.000075,
    bestFor: 'Long conversations, journaling analysis'
  },

  // ============================================
  // PREMIUM MODELS (Require subscription)
  // ============================================
  
  // OpenAI Premium
  'gpt-4o': {
    provider: 'OpenAI',
    model: openai('gpt-4o'),
    name: 'GPT-4o',
    description: 'Most capable OpenAI model, excellent reasoning',
    tier: 'PREMIUM',
    costPer1kTokens: 0.005,
    bestFor: 'Complex exercises, deep analysis'
  },

  'gpt-4-turbo': {
    provider: 'OpenAI',
    model: openai('gpt-4-turbo'),
    name: 'GPT-4 Turbo',
    description: 'Powerful and fast, great balance',
    tier: 'PREMIUM',
    costPer1kTokens: 0.01,
    bestFor: 'Structured exercises, frameworks'
  },

  // Anthropic Claude (Best for therapeutic work)
  'claude-3-5-sonnet': {
    provider: 'Anthropic',
    model: anthropic('claude-3-5-sonnet-20241022'),
    name: 'Claude 3.5 Sonnet',
    description: '⭐ Best for therapeutic conversations - empathetic & nuanced',
    tier: 'PREMIUM',
    costPer1kTokens: 0.003,
    bestFor: 'Therapeutic exercises, emotional support, trauma work'
  },

  'claude-3-5-haiku': {
    provider: 'Anthropic',
    model: anthropic('claude-3-5-haiku-20241022'),
    name: 'Claude 3.5 Haiku',
    description: 'Fast Claude model with great quality',
    tier: 'PREMIUM',
    costPer1kTokens: 0.001,
    bestFor: 'Quick therapeutic check-ins'
  },

  'claude-3-opus': {
    provider: 'Anthropic',
    model: anthropic('claude-3-opus-20240229'),
    name: 'Claude 3 Opus',
    description: 'Most powerful Claude - deep understanding',
    tier: 'PREMIUM',
    costPer1kTokens: 0.015,
    bestFor: 'Complex trauma processing, deep frameworks'
  },

  // Google Gemini Premium
  'gemini-1.5-pro': {
    provider: 'Google',
    model: google('gemini-1.5-pro-latest'),
    name: 'Gemini 1.5 Pro',
    description: 'Massive 2M token context window',
    tier: 'PREMIUM',
    costPer1kTokens: 0.00125,
    bestFor: 'Long therapeutic sessions, comprehensive analysis'
  },

  'gemini-2.0-flash': {
    provider: 'Google',
    model: google('gemini-2.0-flash-exp'),
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Latest experimental Gemini - very fast',
    tier: 'PREMIUM',
    costPer1kTokens: 0.0001,
    bestFor: 'Testing new capabilities'
  },
}

export type ModelId = keyof typeof modelRegistry

/**
 * Get models available for a specific subscription tier
 */
export function getModelsByTier(tier: 'FREE' | 'PREMIUM' | 'INSTITUTION'): ModelId[] {
  return Object.entries(modelRegistry)
    .filter(([_, config]) => {
      if (tier === 'FREE') return config.tier === 'FREE'
      // Premium and Institution users see all models
      return true
    })
    .map(([id]) => id as ModelId)
}

/**
 * Get the AI model instance by ID
 */
export function getModel(modelId: ModelId) {
  const config = modelRegistry[modelId]
  if (!config) {
    console.warn(`Model ${modelId} not found, falling back to gpt-4o-mini`)
    return modelRegistry['gpt-4o-mini'].model
  }
  return config.model
}

/**
 * Get model configuration
 */
export function getModelConfig(modelId: ModelId): ModelConfig {
  return modelRegistry[modelId]
}

/**
 * Get recommended model for therapeutic work (Premium users)
 */
export function getRecommendedTherapeuticModel(): ModelId {
  return 'claude-3-5-sonnet'
}

/**
 * Get default model for user's tier
 */
export function getDefaultModelForTier(tier: 'FREE' | 'PREMIUM' | 'INSTITUTION'): ModelId {
  if (tier === 'FREE') return 'deepseek-chat'
  return 'claude-3-5-sonnet' // Premium users start with best therapeutic model
}

/**
 * Estimate cost for a conversation
 */
export function estimateCost(modelId: ModelId, inputTokens: number, outputTokens: number): number {
  const config = modelRegistry[modelId]
  if (!config) return 0
  
  const totalTokens = inputTokens + outputTokens
  return (totalTokens / 1000) * config.costPer1kTokens
}
