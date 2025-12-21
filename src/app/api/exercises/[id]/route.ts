import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getExerciseById, getFrameworkById } from '@/lib/exercise-search'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load exercise using search utility
    const exercise = await getExerciseById(params.id)

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Load associated framework using search utility
    const framework = await getFrameworkById(exercise.framework)

    if (!framework) {
      return NextResponse.json({ 
        error: 'Framework not found',
        details: `Framework ID "${exercise.framework}" not found in database` 
      }, { status: 404 })
    }

    return NextResponse.json({
      exercise,
      framework
    })
  } catch (error) {
    console.error('Error loading exercise:', error)
    return NextResponse.json(
      { error: 'Failed to load exercise' },
      { status: 500 }
    )
  }
}
