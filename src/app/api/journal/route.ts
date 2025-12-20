import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * GET /api/journal
 * Fetch user's journal entries with optional date range filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters for date filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // Fetch journal entries
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    })

    return NextResponse.json(
      { entries },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/journal
 * Create a new journal entry for today
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date, mood, energy, content, gratitude, goals } = body

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate mood and energy if provided
    if (mood !== undefined && (mood < 1 || mood > 10)) {
      return NextResponse.json(
        { error: 'Mood must be between 1 and 10' },
        { status: 400 }
      )
    }

    if (energy !== undefined && (energy < 1 || energy > 10)) {
      return NextResponse.json(
        { error: 'Energy must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Use provided date or default to today
    const entryDate = date ? new Date(date) : new Date()
    // Normalize to start of day to ensure uniqueness constraint works
    entryDate.setHours(0, 0, 0, 0)

    // Create or update journal entry (upsert to handle one entry per day)
    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: entryDate
        }
      },
      update: {
        mood: mood !== undefined ? mood : null,
        energy: energy !== undefined ? energy : null,
        content,
        gratitude: gratitude || null,
        goals: goals || null,
      },
      create: {
        userId: session.user.id,
        date: entryDate,
        mood: mood !== undefined ? mood : null,
        energy: energy !== undefined ? energy : null,
        content,
        gratitude: gratitude || null,
        goals: goals || null,
      }
    })

    return NextResponse.json(
      { entry },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}
