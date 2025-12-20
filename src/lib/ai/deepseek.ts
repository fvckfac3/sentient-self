/**
 * DeepSeek AI Provider
 * Primary provider for Sentient Self using DeepSeek R1 model
 */

import type { AIMessage, AICompletionOptions, AICompletionResponse, AIService, AIProviderConfig } from './types'

const DEFAULT_MODEL = 'deepseek-reasoner'
const API_BASE_URL = 'https://api.deepseek.com/v1'

export class DeepSeekProvider implements AIService {
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
                    max_tokens: maxTokens,
                    stream: false
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('DeepSeek API error:', error)
                throw new Error(`DeepSeek API error: ${response.status}`)
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
            console.error('DeepSeek completion error:', error)
            throw error
        }
    }

    async *streamComplete(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string> {
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
                    max_tokens: maxTokens,
                    stream: true
                })
            })

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') return

                        try {
                            const parsed = JSON.parse(data)
                            const content = parsed.choices?.[0]?.delta?.content
                            if (content) yield content
                        } catch {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error('DeepSeek stream error:', error)
            throw error
        }
    }
}
