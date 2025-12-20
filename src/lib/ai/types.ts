/**
 * AI Provider Types and Interfaces
 */

export type AIProvider = 'deepseek' | 'openai' | 'anthropic'

export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AICompletionOptions {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
}

export interface AICompletionResponse {
    content: string
    finishReason?: 'stop' | 'length' | 'error'
    usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
    }
}

export interface AIProviderConfig {
    apiKey: string
    baseUrl?: string
    defaultModel?: string
}

export interface AIService {
    complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>
    streamComplete?(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string>
}
