/**
 * Anthropic Provider (Claude)
 * Alternative fallback provider for Sentient Self
 */

import type { AIMessage, AICompletionOptions, AICompletionResponse, AIService, AIProviderConfig } from './types'

const DEFAULT_MODEL = 'claude-3-opus-20240229'
const API_BASE_URL = 'https://api.anthropic.com/v1'
const API_VERSION = '2023-06-01'

export class AnthropicProvider implements AIService {
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

        // Separate system message from conversation messages
        const systemMessage = messages.find(m => m.role === 'system')?.content || ''
        const conversationMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            }))

        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': API_VERSION
                },
                body: JSON.stringify({
                    model,
                    system: systemMessage,
                    messages: conversationMessages,
                    temperature,
                    max_tokens: maxTokens
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Anthropic API error:', error)
                throw new Error(`Anthropic API error: ${response.status}`)
            }

            const data = await response.json()

            return {
                content: data.content?.[0]?.text || '',
                finishReason: data.stop_reason === 'end_turn' ? 'stop' : data.stop_reason,
                usage: data.usage ? {
                    promptTokens: data.usage.input_tokens,
                    completionTokens: data.usage.output_tokens,
                    totalTokens: data.usage.input_tokens + data.usage.output_tokens
                } : undefined
            }
        } catch (error) {
            console.error('Anthropic completion error:', error)
            throw error
        }
    }
}
