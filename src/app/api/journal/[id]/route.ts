import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * GET /api/journal/[id]
 * Fetch a single journal entry by ID
 */
export async function GET(
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

    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    // Verify user owns this entry
    if (entry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { entry },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/journal/[id]
 * Update an existing journal entry
 */
export async function PUT(
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

    // Check if entry exists and user owns it
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { mood, energy, content, gratitude, goals } = body

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

    // Update entry
    const entry = await prisma.journalEntry.update({
      where: { id: params.id },
      data: {
        ...(mood !== undefined && { mood }),
        ...(energy !== undefined && { energy }),
        ...(content !== undefined && { content }),
        ...(gratitude !== undefined && { gratitude }),
        ...(goals !== undefined && { goals }),
      }
    })

    return NextResponse.json(
      { entry },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/journal/[id]
 * Delete a journal entry
 */
export async function DELETE(
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

    // Check if entry exists and user owns it
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete entry
    await prisma.journalEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}
