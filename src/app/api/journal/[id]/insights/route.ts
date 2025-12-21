import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateJournalInsights } from '@/lib/ai-insights'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        subscriptionTier: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has Premium or Institution tier
    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade to access AI insights' },
        { status: 403 }
      )
    }

    // Get journal entry
    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (entry.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if insights already exist
    if (entry.insights) {
      return NextResponse.json(
        { insights: entry.insights, cached: true },
        { status: 200 }
      )
    }

    // Generate insights
    const insights = await generateJournalInsights({
      content: entry.content,
      mood: entry.mood,
      energy: entry.energy,
      gratitude: entry.gratitude,
      goals: entry.goals,
    })

    // Save insights to entry
    const updatedEntry = await prisma.journalEntry.update({
      where: { id: params.id },
      data: { insights }
    })

    return NextResponse.json(
      { insights: updatedEntry.insights, cached: false },
      { status: 200 }
    )
  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
