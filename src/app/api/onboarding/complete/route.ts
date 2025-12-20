import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const baselineProfile = await request.json()

    // Create or update baseline profile
    await prisma.baselineProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        primaryIntents: baselineProfile.primary_intents || [],
        currentChallenges: baselineProfile.current_challenges || [],
        emotionalBaseline: baselineProfile.emotional_baseline || [],
        tonePreference: baselineProfile.support_preferences?.tone || '',
        exerciseOpenness: baselineProfile.support_preferences?.exercise_openness || '',
        recoveryStage: baselineProfile.addiction_context?.recovery_stage || null,
        substances: baselineProfile.addiction_context?.substances || []
      },
      update: {
        primaryIntents: baselineProfile.primary_intents || [],
        currentChallenges: baselineProfile.current_challenges || [],
        emotionalBaseline: baselineProfile.emotional_baseline || [],
        tonePreference: baselineProfile.support_preferences?.tone || '',
        exerciseOpenness: baselineProfile.support_preferences?.exercise_openness || '',
        recoveryStage: baselineProfile.addiction_context?.recovery_stage || null,
        substances: baselineProfile.addiction_context?.substances || []
      }
    })

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingDone: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}