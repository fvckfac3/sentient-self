import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchExercises } from '@/lib/exercise-search'

import { rateLimit, rateLimitResponse, LIMITS } from '@/lib/rate-limit'
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limited = await rateLimit({ key: `exercise-search:${session.user.id}`, ...LIMITS.exerciseSearch })
    if (!limited.success) return rateLimitResponse(limited)

    const body = await req.json()
    const { keywords, topic, framework, limit } = body

    // Validate input
    if (!keywords && !topic && !framework) {
      return NextResponse.json(
        { error: 'At least one search parameter required (keywords, topic, or framework)' },
        { status: 400 }
      )
    }

    const exercises = await searchExercises({
      keywords: keywords || [],
      topic,
      framework,
      limit: limit || 3
    })

    return NextResponse.json({ 
      exercises,
      count: exercises.length 
    })
  } catch (error) {
    console.error('Exercise search error:', error)
    return NextResponse.json(
      { error: 'Failed to search exercises' },
      { status: 500 }
    )
  }
}
