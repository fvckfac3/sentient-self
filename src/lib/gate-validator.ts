/**
 * Exercise Suggestion Gate Validator
 * 
 * Enforces the 5 mandatory conditions before AI can suggest exercises:
 * 1. User has articulated a concrete challenge or pattern
 * 2. AI has accurately reflected their experience
 * 3. User appears emotionally regulated
 * 4. AI can clearly explain why structure would help
 * 5. User has not recently declined exercises
 */

import { prisma } from './prisma'

export interface GateStatus {
  condition1_challengeArticulated: boolean
  condition2_aiReflectedAccurately: boolean
  condition3_userEmotionallyRegulated: boolean
  condition4_structureExplained: boolean
  condition5_noRecentDecline: boolean
  allConditionsMet: boolean
  failedConditions: string[]
}

/**
 * Check if all gate conditions are met for a conversation
 */
export async function validateGate(conversationId: string): Promise<GateStatus> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      gateCondition1_challengeArticulated: true,
      gateCondition2_aiReflectedAccurately: true,
      gateCondition3_userEmotionallyRegulated: true,
      gateCondition4_structureExplained: true,
      gateCondition5_noRecentDecline: true,
      lastDeclinedAt: true,
    }
  })

  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`)
  }

  const status: GateStatus = {
    condition1_challengeArticulated: conversation.gateCondition1_challengeArticulated,
    condition2_aiReflectedAccurately: conversation.gateCondition2_aiReflectedAccurately,
    condition3_userEmotionallyRegulated: conversation.gateCondition3_userEmotionallyRegulated,
    condition4_structureExplained: conversation.gateCondition4_structureExplained,
    condition5_noRecentDecline: conversation.gateCondition5_noRecentDecline,
    allConditionsMet: false,
    failedConditions: []
  }

  // Check each condition
  if (!status.condition1_challengeArticulated) {
    status.failedConditions.push('No concrete challenge articulated')
  }
  if (!status.condition2_aiReflectedAccurately) {
    status.failedConditions.push('AI has not reflected user experience accurately')
  }
  if (!status.condition3_userEmotionallyRegulated) {
    status.failedConditions.push('User may not be emotionally regulated')
  }
  if (!status.condition4_structureExplained) {
    status.failedConditions.push('AI has not explained why structure would help')
  }
  if (!status.condition5_noRecentDecline) {
    status.failedConditions.push('User recently declined exercises')
  }

  // All conditions must be true
  status.allConditionsMet = status.failedConditions.length === 0

  return status
}

/**
 * Update gate conditions for a conversation
 */
export async function updateGateConditions(
  conversationId: string,
  conditions: {
    condition1_challengeArticulated?: boolean
    condition2_aiReflectedAccurately?: boolean
    condition3_userEmotionallyRegulated?: boolean
    condition4_structureExplained?: boolean
    condition5_noRecentDecline?: boolean
  }
): Promise<void> {
  const updateData: any = {}

  if (conditions.condition1_challengeArticulated !== undefined) {
    updateData.gateCondition1_challengeArticulated = conditions.condition1_challengeArticulated
  }
  if (conditions.condition2_aiReflectedAccurately !== undefined) {
    updateData.gateCondition2_aiReflectedAccurately = conditions.condition2_aiReflectedAccurately
  }
  if (conditions.condition3_userEmotionallyRegulated !== undefined) {
    updateData.gateCondition3_userEmotionallyRegulated = conditions.condition3_userEmotionallyRegulated
  }
  if (conditions.condition4_structureExplained !== undefined) {
    updateData.gateCondition4_structureExplained = conditions.condition4_structureExplained
  }
  if (conditions.condition5_noRecentDecline !== undefined) {
    updateData.gateCondition5_noRecentDecline = conditions.condition5_noRecentDecline
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: updateData
  })
}

/**
 * Mark that user declined an exercise suggestion
 * This sets condition 5 to false and records the timestamp
 */
export async function recordExerciseDecline(conversationId: string): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      gateCondition5_noRecentDecline: false,
      lastDeclinedAt: new Date()
    }
  })

  console.log(`📝 Recorded exercise decline for conversation ${conversationId}`)
}

/**
 * Reset decline flag if enough time has passed (24 hours)
 * This allows the AI to suggest exercises again after a cooling-off period
 */
export async function maybeResetDeclineFlag(conversationId: string): Promise<boolean> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      gateCondition5_noRecentDecline: true,
      lastDeclinedAt: true
    }
  })

  if (!conversation) {
    return false
  }

  // If decline flag is false and 24 hours have passed, reset it
  if (!conversation.gateCondition5_noRecentDecline && conversation.lastDeclinedAt) {
    const hoursSinceDecline = (Date.now() - conversation.lastDeclinedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceDecline >= 24) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          gateCondition5_noRecentDecline: true
        }
      })
      
      console.log(`✅ Reset decline flag for conversation ${conversationId} (${hoursSinceDecline.toFixed(1)}h since decline)`)
      return true
    }
  }

  return false
}

/**
 * Detect if user message indicates they're declining an exercise
 */
export function detectDeclineInMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  
  const declinePatterns = [
    'no thanks',
    'not right now',
    'maybe later',
    'i don\'t want to',
    'not interested',
    'skip',
    'pass',
    'i\'d rather just talk',
    'can we just chat',
    'not ready',
    'i don\'t think so',
    'no thank you',
    'nah',
    'no',
  ]

  return declinePatterns.some(pattern => {
    // Check if pattern exists as a standalone phrase or at boundaries
    const regex = new RegExp(`(^|\\s)${pattern}($|\\s|[.,!?])`, 'i')
    return regex.test(lowerMessage)
  })
}

/**
 * Analyze AI response to detect if it's accurately reflecting user experience
 * This is a heuristic - looks for reflective language
 */
export function detectReflectiveLanguage(aiResponse: string): boolean {
  const lowerResponse = aiResponse.toLowerCase()
  
  const reflectivePatterns = [
    'i hear',
    'it sounds like',
    'it seems like',
    'what i\'m hearing',
    'you\'re saying',
    'you\'re feeling',
    'you mentioned',
    'it seems that',
    'from what you\'ve shared',
    'you\'re experiencing',
    'that must feel',
    'i understand that'
  ]

  return reflectivePatterns.some(pattern => lowerResponse.includes(pattern))
}

/**
 * Detect if user message articulates a concrete challenge
 * Looks for problem statements, struggle language, etc.
 */
export function detectConcreteChallenge(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  const challengePatterns = [
    'struggling with',
    'having trouble',
    'difficult for me',
    'hard to',
    'can\'t seem to',
    'problem with',
    'issue with',
    'dealing with',
    'challenge',
    'frustrated',
    'overwhelmed',
    'stuck',
    'failing',
    'relapsed',
    'craving',
    'triggered',
    'anxious about',
    'worried about',
    'scared of',
    'ashamed',
    'guilty'
  ]

  return challengePatterns.some(pattern => lowerMessage.includes(pattern))
}

/**
 * Get a human-readable gate status summary
 */
export function getGateSummary(status: GateStatus): string {
  if (status.allConditionsMet) {
    return '✅ All gate conditions met - AI can suggest exercises'
  }

  return `❌ Gate blocked - Missing: ${status.failedConditions.join(', ')}`
}
