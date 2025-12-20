/**
 * OpenAI Provider (GPT-4)
 * Fallback provider for Sentient Self
 */

import type { AIMessage, AICompletionOptions, AICompletionResponse, AIService, AIProviderConfig } from './types'

const DEFAULT_MODEL = 'gpt-4-turbo-preview'
const API_BASE_URL = 'https://api.openai.com/v1'

export class OpenAIProvider implements AIService {
    private apiKey: string
    private baseUrl: string
    private defaultModel: string

    constructor(config: AIProviderConfig) {
        this.apiKey = config.apiKey
        this.baseUrl = config.baseUrl || API_BASE_URL
        this.defaultModel = config.defaultModel || DEFAULT_MODEL
    }

    async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse> {
        const model = options?.model || this.defaultModel
        const temperature = options?.temperature ?? 0.7
        const maxTokens = options?.maxTokens ?? 1024

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('OpenAI API error:', error)
                throw new Error(`OpenAI API error: ${response.status}`)
            }

            const data = await response.json()

            return {
                content: data.choices?.[0]?.message?.content || '',
                finishReason: data.choices?.[0]?.finish_reason || 'stop',
                usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                } : undefined
            }
        } catch (error) {
            console.error('OpenAI completion error:', error)
            throw error
        }
    }
}
