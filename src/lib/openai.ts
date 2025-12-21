import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateJournalInsights(entry: {
  content: string
  mood: number | null
  energy: number | null
  gratitude?: string | null
  goals?: string | null
}) {
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

Keep it warm, brief, and supportive.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
  })

  return response.choices[0].message.content || 'No insights generated.'
}
