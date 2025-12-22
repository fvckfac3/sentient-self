import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getActiveExercise, cancelExercise } from '@/lib/exercise-facilitator'

/**
 * GET - Get active exercise for conversation
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    const exercise = await getActiveExercise(conversationId)
    
    return NextResponse.json({ 
      exercise,
      hasActiveExercise: exercise !== null 
    })
  } catch (error) {
    console.error('Get active exercise error:', error)
    return NextResponse.json(
      { error: 'Failed to get active exercise' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel active exercise
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    await cancelExercise(conversationId)
    
    return NextResponse.json({ 
      success: true,
      message: 'Exercise cancelled successfully' 
    })
  } catch (error) {
    console.error('Cancel exercise error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel exercise' },
      { status: 500 }
    )
  }
}
