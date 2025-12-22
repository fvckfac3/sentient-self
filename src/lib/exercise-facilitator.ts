/**
 * Exercise Facilitator
 * 
 * Manages framework-guided exercise facilitation
 * - Loads exercises and their frameworks
 * - Tracks phase progression
 * - Builds framework-aware prompts for AI
 * - Handles exercise completion and reflection
 */

import { prisma } from './prisma'
import { Exercise } from '@/types'

export interface ExerciseContext {
  exercise: {
    id: string
    title: string
    aspect: string
    aiPrompt: string
    framework: string
    topic: string
  }
  framework: {
    id: string
    name: string
    description: string
    coreMechanism: string
    phases: Array<{
      phase_name: string
      ai_role: string
      user_action: string
      processing_instruction: string
    }>
  }
  currentPhase: number
  totalPhases: number
}

/**
 * Start a new exercise session
 */
export async function startExercise(
  conversationId: string,
  exerciseId: string
): Promise<ExerciseContext> {
  // Get exercise from database
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId }
  })

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`)
  }

  // Get framework data
  const framework = await prisma.framework.findUnique({
    where: { id: exercise.framework }
  })

  if (!framework) {
    throw new Error(`Framework ${exercise.framework} not found`)
  }

  // Update conversation to track active exercise
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      activeExerciseId: exerciseId,
      activeFrameworkId: exercise.framework,
      currentPhaseIndex: 0,
      exerciseStartedAt: new Date(),
      state: 'EXERCISE_FACILITATION'
    }
  })

  console.log(`🎯 Started exercise: ${exercise.title} (${exercise.framework})`)

  const phases = framework.phases as any[]

  return {
    exercise: {
      id: exercise.id,
      title: exercise.title,
      aspect: exercise.aspect,
      aiPrompt: exercise.aiPrompt,
      framework: exercise.framework,
      topic: exercise.topic || 'General'
    },
    framework: {
      id: framework.id,
      name: framework.name,
      description: framework.description,
      coreMechanism: framework.coreMechanism,
      phases: phases
    },
    currentPhase: 0,
    totalPhases: phases.length
  }
}

/**
 * Get active exercise context for conversation
 */
export async function getActiveExercise(
  conversationId: string
): Promise<ExerciseContext | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation?.activeExerciseId || !conversation.activeFrameworkId) {
    return null
  }

  // Get exercise
  const exercise = await prisma.exercise.findUnique({
    where: { id: conversation.activeExerciseId }
  })

  // Get framework
  const framework = await prisma.framework.findUnique({
    where: { id: conversation.activeFrameworkId }
  })

  if (!exercise || !framework) {
    console.warn('Active exercise or framework not found, clearing active exercise')
    await cancelExercise(conversationId)
    return null
  }

  const phases = framework.phases as any[]

  return {
    exercise: {
      id: exercise.id,
      title: exercise.title,
      aspect: exercise.aspect,
      aiPrompt: exercise.aiPrompt,
      framework: exercise.framework,
      topic: exercise.topic || 'General'
    },
    framework: {
      id: framework.id,
      name: framework.name,
      description: framework.description,
      coreMechanism: framework.coreMechanism,
      phases: phases
    },
    currentPhase: conversation.currentPhaseIndex,
    totalPhases: phases.length
  }
}

/**
 * Advance to next phase
 */
export async function advancePhase(conversationId: string): Promise<number> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation?.activeExerciseId) {
    throw new Error('No active exercise')
  }

  const nextPhase = conversation.currentPhaseIndex + 1

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      currentPhaseIndex: nextPhase
    }
  })

  console.log(`📋 Advanced to phase ${nextPhase + 1}`)

  return nextPhase
}

/**
 * Complete exercise with reflection
 */
export async function completeExercise(
  conversationId: string,
  reflection: string
): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation?.activeExerciseId) {
    throw new Error('No active exercise to complete')
  }

  const exerciseId = conversation.activeExerciseId

  // Create exercise completion record
  await prisma.exerciseCompletion.create({
    data: {
      userId: conversation.userId,
      exerciseId: exerciseId,
      reflection: reflection
    }
  })

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      exerciseCompletedAt: new Date(),
      exerciseReflection: reflection,
      exercisesCompleted: conversation.exercisesCompleted + 1,
      state: 'POST_EXERCISE_INTEGRATION',
      // Clear active exercise
      activeExerciseId: null,
      activeFrameworkId: null,
      currentPhaseIndex: 0
    }
  })

  console.log(`✅ Exercise completed! Total: ${conversation.exercisesCompleted + 1}`)
}

/**
 * Cancel/exit exercise
 */
export async function cancelExercise(conversationId: string): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      activeExerciseId: null,
      activeFrameworkId: null,
      currentPhaseIndex: 0,
      exerciseStartedAt: null,
      state: 'SUPPORTIVE_PROCESSING'
    }
  })

  console.log('🚫 Exercise cancelled')
}

/**
 * Build framework-aware system prompt for AI
 */
export function buildExercisePrompt(context: ExerciseContext): string {
  const { exercise, framework, currentPhase } = context
  const phase = framework.phases[currentPhase]

  // Build phase progress indicator
  const phaseProgress = framework.phases.map((p: any, i: number) => {
    if (i === currentPhase) {
      return `→ **${i + 1}. ${p.phase_name}** (CURRENT)`
    } else if (i < currentPhase) {
      return `✓ ${i + 1}. ${p.phase_name}`
    } else {
      return `  ${i + 1}. ${p.phase_name}`
    }
  }).join('\n')

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎯 ACTIVE EXERCISE: ${exercise.title}

## Exercise Focus
**Topic:** ${exercise.topic}
**Aspect:** ${exercise.aspect}

${exercise.aiPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Framework: ${framework.name}
${framework.description}

**Core Mechanism:** ${framework.coreMechanism}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Current Phase: ${currentPhase + 1} of ${framework.phases.length}

### Phase ${currentPhase + 1}: ${phase.phase_name}

**Your Role as AI:**
${phase.ai_role}

**Guide the User To:**
${phase.user_action}

**Processing Approach:**
${phase.processing_instruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 FACILITATION RULES (CRITICAL)

1. **ASK ONE QUESTION AT A TIME**
2. **WAIT for user response before continuing**
3. **FOLLOW framework phases in order**
4. **DO NOT skip phases**
5. **DO NOT mix frameworks**
6. **STAY IN CHARACTER** as defined by the phase's AI role
7. When phase objectives are met, **naturally transition** to next phase
8. After final phase, **ask for a brief reflection** to complete exercise
9. User can say "exit exercise" to stop at any time

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Phase Progress
${phaseProgress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}

/**
 * Detect if user wants to exit exercise
 */
export function detectExerciseExit(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  
  const exitPatterns = [
    'exit exercise',
    'stop exercise',
    'cancel exercise',
    'quit exercise',
    'end exercise',
    'i want to stop',
    'let\'s stop',
    'can we stop'
  ]

  return exitPatterns.some(pattern => lowerMessage.includes(pattern))
}

/**
 * Detect if message is likely a reflection (substantive response)
 */
export function detectReflection(message: string): boolean {
  // Must be substantive (50+ chars, 10+ words)
  const wordCount = message.trim().split(/\s+/).length
  const charCount = message.trim().length
  
  return charCount >= 50 && wordCount >= 10
}

/**
 * Detect if user is accepting an exercise
 */
export function detectExerciseAcceptance(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  
  const acceptPatterns = [
    /^(yes|yeah|sure|okay|ok|yep|yup)$/i,
    /let'?s do (it|that|this|one)/i,
    /i'?ll try (it|that|this|one)/i,
    /sounds? good/i,
    /(first|second|third|1|2|3) (one|exercise)/i,
    /exercise (1|2|3|one|two|three)/i,
    /i'?d like to try/i,
    /start/i
  ]

  return acceptPatterns.some(pattern => pattern.test(lowerMessage))
}
