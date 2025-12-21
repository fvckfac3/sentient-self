/**
 * AI-powered journal insights using Vercel AI SDK
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export interface JournalEntryData {
  content: string
  mood: number | null
  energy: number | null
  gratitude?: string | null
  goals?: string | null
}

/**
 * Generate AI insights for a journal entry
 * Uses GPT-4o-mini for cost-effective, high-quality analysis
 */
export async function generateJournalInsights(entry: JournalEntryData): Promise<string> {
  const prompt = `You are a supportive AI coach analyzing a daily journal entry. Provide brief, encouraging insights (2-3 sentences).

Journal Entry:
- Mood: ${entry.mood}/10
- Energy: ${entry.energy}/10
- Content: ${entry.content}
${entry.gratitude ? `- Gratitude: ${entry.gratitude}` : ''}
${entry.goals ? `- Goals: ${entry.goals}` : ''}

Provide personalized, empathetic insights that:
1. Acknowledge their emotional state
2. Highlight positive patterns or growth
3. Offer gentle encouragement or actionable suggestion

Keep it warm, brief, and supportive. Focus on their strengths and resilience.`

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error('Error generating journal insights:', error)
    throw new Error('Failed to generate insights. Please try again.')
  }
}
