import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIController } from '@/lib/ai-controller'
import { ConversationState } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, exerciseId, modelId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get or create conversation
    let conversation = conversationId 
      ? await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } }
        })
      : null

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          state: 'CONVERSATIONAL_DISCOVERY'
        },
        include: { messages: true }
      })
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { baselineProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if onboarding is completed
    if (!user.onboardingDone) {
      return NextResponse.json({ 
        error: 'Please complete onboarding first',
        requiresOnboarding: true 
      }, { status: 403 })
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message
      }
    })

    // Load exercise and framework if exerciseId is provided
    let exerciseContext: { exercise: any; framework: any } | undefined = undefined
    if (exerciseId) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
      })

      if (exercise) {
        const framework = await prisma.framework.findUnique({
          where: { id: exercise.framework },
        })

        if (framework) {
          exerciseContext = {
            exercise,
            framework
          }
        }
      }
    }

    // Prepare AI controller
    const recentMessages = conversation.messages.slice(-10).map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }))

    const aiController = new AIController({
      user,
      conversationId: conversation.id,
      currentState: conversation.state,
      recentMessages,
      exerciseContext,
      modelId
    })

    // Generate AI response
    const aiResponse = await aiController.generateResponse(message)

    // Save AI response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'AI',
        content: aiResponse.content
      }
    })

    // Update conversation state
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { state: aiResponse.newState }
    })

    return NextResponse.json({
      response: aiResponse.content,
      state: aiResponse.newState,
      conversationId: conversation.id,
      suggestedExercises: aiResponse.suggestedExercises,
      crisisDetected: aiResponse.crisisDetected,
      metadata: aiResponse.metadata
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}