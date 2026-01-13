import { prisma } from '@/lib/prisma'
import { getModel } from '@/lib/models'
import { generateText } from 'ai'

/**
 * Insight Synthesis Service
 * 
 * Per PRD Core Systems:
 * - Exactly one insight per completed exercise
 * - Syntheses are immutable
 * - No insight without completed exercise
 */

interface GenerateInsightParams {
    userId: string
    exerciseCompletionId: string
    exerciseId: string
    exerciseTitle: string
    exerciseFramework: string
    reflection: string
    userContext?: {
        intents?: string[]
        challenges?: string[]
        emotionalBaseline?: string[]
    }
}

export async function generateInsight(params: GenerateInsightParams) {
    const {
        userId,
        exerciseCompletionId,
        exerciseId,
        exerciseTitle,
        exerciseFramework,
        reflection,
        userContext
    } = params

    // Check if insight already exists (immutability)
    const existingInsight = await prisma.insight.findUnique({
        where: { exerciseCompletionId }
    })

    if (existingInsight) {
        return existingInsight
    }

    // Generate synthesis using AI
    const synthesisPrompt = buildSynthesisPrompt(
        exerciseTitle,
        exerciseFramework,
        reflection,
        userContext
    )

    const model = getModel('deepseek-chat')

    let synthesis = ''
    let annotations: string[] = []

    try {
        const result = await generateText({
            model,
            messages: [
                {
                    role: 'system',
                    content: `You are a therapeutic insight synthesizer. Your role is to create meaningful, 
concise summaries of exercise completions that highlight key realizations and growth patterns.

Be warm, validating, and avoid clinical language. Focus on strengths and progress.
Never use moral framing or judgment. Use neurobiological and psychological framing.

Output format:
- First paragraph: A 2-3 sentence synthesis of the key insight from this exercise
- Second section: 3-5 short annotation phrases (themes/patterns observed), separated by |

Example annotations: "self-compassion practice | recognizing triggers | breaking shame cycles | values alignment"`
                },
                {
                    role: 'user',
                    content: synthesisPrompt
                }
            ],
            maxTokens: 500
        })

        const text = result.text || ''

        // Parse the response
        const parts = text.split('\n\n')
        synthesis = parts[0] || text

        if (parts[1]) {
            annotations = parts[1]
                .split('|')
                .map(a => a.trim())
                .filter(a => a.length > 0 && a.length < 50)
        }
    } catch (error) {
        console.error('Error generating insight synthesis:', error)
        // Fallback synthesis
        synthesis = `You completed the "${exerciseTitle}" exercise using the ${exerciseFramework} framework. Your reflection shows meaningful engagement with the process.`
        annotations = ['exercise completion', 'self-reflection']
    }

    // Create immutable insight
    const insight = await prisma.insight.create({
        data: {
            userId,
            exerciseCompletionId,
            exerciseId,
            synthesis,
            annotations
        }
    })

    return insight
}

function buildSynthesisPrompt(
    exerciseTitle: string,
    framework: string,
    reflection: string,
    userContext?: {
        intents?: string[]
        challenges?: string[]
        emotionalBaseline?: string[]
    }
): string {
    let prompt = `Exercise: ${exerciseTitle}
Framework: ${framework}

User's Reflection:
${reflection}
`

    if (userContext?.intents?.length) {
        prompt += `\nUser's Growth Intents: ${userContext.intents.join(', ')}`
    }

    if (userContext?.challenges?.length) {
        prompt += `\nCurrent Challenges: ${userContext.challenges.join(', ')}`
    }

    prompt += `\n\nPlease synthesize the key insight from this exercise completion, followed by 3-5 annotation phrases separated by |.`

    return prompt
}

/**
 * Get all insights for a user
 */
export async function getUserInsights(userId: string) {
    return prisma.insight.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            exerciseCompletion: {
                include: {
                    exercise: {
                        select: {
                            title: true,
                            framework: true,
                            topic: true
                        }
                    }
                }
            }
        }
    })
}

/**
 * Get a single insight by ID
 */
export async function getInsight(insightId: string, userId: string) {
    return prisma.insight.findFirst({
        where: {
            id: insightId,
            userId // Ensure user can only access their own insights
        },
        include: {
            exerciseCompletion: {
                include: {
                    exercise: {
                        select: {
                            title: true,
                            framework: true,
                            topic: true,
                            aspect: true
                        }
                    }
                }
            }
        }
    })
}
