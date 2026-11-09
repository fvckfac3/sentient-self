/**
 * Model Registry for Vercel AI SDK Multi-Model Support (server only)
 *
 * Metadata and tier rules live in `model-catalog.ts`, which is safe to import
 * from client components. This file creates the provider instances.
 */

import type { LanguageModel } from 'ai'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { MODEL_CATALOG, DEFAULT_FREE_MODEL, isModelId, type ModelId } from './model-catalog'

export * from './model-catalog'

// DeepSeek provider (OpenAI-compatible Chat Completions API)
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

/**
 * Get the AI model instance by ID
 */
export function getModel(modelId: ModelId | string): LanguageModel {
  const id = isModelId(modelId) ? modelId : DEFAULT_FREE_MODEL
  if (id !== modelId) {
    console.warn(`Model ${modelId} not found, falling back to ${DEFAULT_FREE_MODEL}`)
  }

  const { provider, apiModelId } = MODEL_CATALOG[id]
  switch (provider) {
    case 'DeepSeek':
      // DeepSeek only implements Chat Completions, not the Responses API
      // that `deepseek(id)` defaults to in @ai-sdk/openai v2.
      return deepseek.chat(apiModelId)
    case 'OpenAI':
      return openai(apiModelId)
    case 'Anthropic':
      return anthropic(apiModelId)
    case 'Google':
      return google(apiModelId)
  }
}

/**
 * Estimate cost for a conversation
 */
export function estimateCost(modelId: ModelId, inputTokens: number, outputTokens: number): number {
  const config = MODEL_CATALOG[modelId]
  if (!config) return 0

  const totalTokens = inputTokens + outputTokens
  return (totalTokens / 1000) * config.costPer1kTokens
}
