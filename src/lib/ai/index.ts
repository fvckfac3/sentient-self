/**
 * AI Service Factory
 * Creates and manages AI provider instances with fallback support
 */

import { DeepSeekProvider } from './deepseek'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import type { AIProvider, AIService, AIMessage, AICompletionOptions, AICompletionResponse } from './types'

export interface AIServiceConfig {
    primaryProvider: AIProvider
    fallbackProvider?: AIProvider
    deepseekApiKey?: string
    openaiApiKey?: string
    anthropicApiKey?: string
}

export class AIServiceFactory {
    private providers: Map<AIProvider, AIService> = new Map()
    private primaryProvider: AIProvider
    private fallbackProvider?: AIProvider

    constructor(config: AIServiceConfig) {
        this.primaryProvider = config.primaryProvider
        this.fallbackProvider = config.fallbackProvider

        // Initialize configured providers
        if (config.deepseekApiKey) {
            this.providers.set('deepseek', new DeepSeekProvider({ apiKey: config.deepseekApiKey }))
        }
        if (config.openaiApiKey) {
            this.providers.set('openai', new OpenAIProvider({ apiKey: config.openaiApiKey }))
        }
        if (config.anthropicApiKey) {
            this.providers.set('anthropic', new AnthropicProvider({ apiKey: config.anthropicApiKey }))
        }
    }

    getProvider(name?: AIProvider): AIService | undefined {
        return this.providers.get(name || this.primaryProvider)
    }

    async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse> {
        const primary = this.getProvider()

        if (!primary) {
            throw new Error(`Primary AI provider '${this.primaryProvider}' not configured`)
        }

        try {
            return await primary.complete(messages, options)
        } catch (error) {
            console.error(`Primary provider ${this.primaryProvider} failed:`, error)

            // Try fallback provider if configured
            if (this.fallbackProvider) {
                const fallback = this.getProvider(this.fallbackProvider)
                if (fallback) {
                    console.log(`Falling back to ${this.fallbackProvider}`)
                    return await fallback.complete(messages, options)
                }
            }

            throw error
        }
    }

    async *streamComplete(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string> {
        const primary = this.getProvider()

        if (!primary) {
            throw new Error(`Primary AI provider '${this.primaryProvider}' not configured`)
        }

        if ('streamComplete' in primary && typeof primary.streamComplete === 'function') {
            yield* primary.streamComplete(messages, options)
        } else {
            // Fallback to non-streaming and yield all at once
            const response = await primary.complete(messages, options)
            yield response.content
        }
    }
}

// Singleton instance getter
let aiService: AIServiceFactory | null = null

export function getAIService(): AIServiceFactory {
    if (!aiService) {
        aiService = new AIServiceFactory({
            primaryProvider: 'deepseek',
            fallbackProvider: 'openai',
            deepseekApiKey: process.env.DEEPSEEK_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            anthropicApiKey: process.env.ANTHROPIC_API_KEY
        })
    }
    return aiService
}

// Export types
export type { AIProvider, AIService, AIMessage, AICompletionOptions, AICompletionResponse } from './types'
