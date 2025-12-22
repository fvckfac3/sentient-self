import { ConversationState, Exercise, UserWithProfile } from '@/types'
import { prisma } from '@/lib/prisma'
import { SYSTEM_PROMPT_V3 } from '@/lib/system-prompt'
import { getModel, getDefaultModelForTier, type ModelId } from '@/lib/models'
import { generateText } from 'ai'
import { z } from 'zod'
import { searchExercises } from './exercise-search'
import { 
  validateGate, 
  updateGateConditions, 
  recordExerciseDecline, 
  maybeResetDeclineFlag,
  detectDeclineInMessage,
  detectReflectiveLanguage,
  detectConcreteChallenge,
  getGateSummary
} from './gate-validator'
import {
  getActiveExercise,
  startExercise,
  buildExercisePrompt,
  completeExercise,
  cancelExercise,
  detectExerciseExit,
  detectReflection,
  detectExerciseAcceptance
} from './exercise-facilitator'

export interface AIControllerConfig {
  user: UserWithProfile
  conversationId: string
  currentState: ConversationState
  recentMessages: Array<{ role: string; content: string }>
  exerciseContext?: {
    exercise: any
    framework: any
  }
  modelId?: ModelId
}

export interface AIResponse {
  content: string
  newState: ConversationState
  suggestedExercises?: Exercise[]
  crisisDetected?: boolean
  metadata?: {
    exerciseGatePassed?: boolean
    crisisIndicators?: string[]
    stateTransitionReason?: string
  }
}

export class AIController {
  private user: UserWithProfile
  private conversationId: string
  private currentState: ConversationState
  private recentMessages: Array<{ role: string; content: string }>
  private exerciseContext?: { exercise: any; framework: any }
  private modelId: ModelId

  constructor(config: AIControllerConfig) {
    this.user = config.user
    this.conversationId = config.conversationId
    this.currentState = config.currentState
    this.recentMessages = config.recentMessages
    this.exerciseContext = config.exerciseContext
    
    // Use provided modelId or fall back to user's preferred model or tier default
    this.modelId = config.modelId || 
                   (this.user.preferredModel as ModelId) || 
                   getDefaultModelForTier(this.user.subscriptionTier as any)
  }

  async generateResponse(userMessage: string): Promise<AIResponse> {
    // Add user message to context
    this.recentMessages.push({ role: 'user', content: userMessage })

    // Step 0: Reset decline flag if enough time has passed
    await maybeResetDeclineFlag(this.conversationId)

    // Step 1: Check for exercise exit command
    if (detectExerciseExit(userMessage)) {
      const activeExercise = await getActiveExercise(this.conversationId)
      if (activeExercise) {
        console.log('🚫 User requested to exit exercise')
        await cancelExercise(this.conversationId)
        return {
          content: "I understand. We can return to our conversation. What would you like to talk about?",
          newState: 'SUPPORTIVE_PROCESSING',
          crisisDetected: false
        }
      }
    }

    // Step 2: Check for decline in user message
    if (detectDeclineInMessage(userMessage)) {
      console.log('🚫 User declined exercise suggestion')
      await recordExerciseDecline(this.conversationId)
    }

    // Step 3: Check if user is accepting an exercise suggestion
    if (this.currentState === 'EXERCISE_SUGGESTION' && detectExerciseAcceptance(userMessage)) {
      console.log('✅ User accepted exercise suggestion')
      
      // Extract exercise ID from recent tool results
      const exerciseId = await this.extractAcceptedExerciseId(userMessage)
      
      if (exerciseId) {
        try {
          const exerciseContext = await startExercise(this.conversationId, exerciseId)
          console.log(`🎯 Started exercise: ${exerciseContext.exercise.title}`)
          
          // Generate response with exercise context
          return await this.generateExerciseResponse(userMessage, exerciseContext)
        } catch (error) {
          console.error('Failed to start exercise:', error)
          // Fall through to normal response generation
        }
      }
    }

    // Step 4: Check for active exercise
    const activeExercise = await getActiveExercise(this.conversationId)
    
    if (activeExercise) {
      console.log(`📋 Active exercise: ${activeExercise.exercise.title} (Phase ${activeExercise.currentPhase + 1}/${activeExercise.totalPhases})`)
      
      // Check if user provided reflection (final step)
      if (detectReflection(userMessage) && activeExercise.currentPhase === activeExercise.totalPhases - 1) {
        console.log('✅ Final reflection received, completing exercise')
        await completeExercise(this.conversationId, userMessage)
        
        return {
          content: "Thank you for completing this exercise and sharing your reflection. You've done meaningful work here. How are you feeling now?",
          newState: 'POST_EXERCISE_INTEGRATION',
          crisisDetected: false
        }
      }
      
      // Continue with active exercise
      return await this.generateExerciseResponse(userMessage, activeExercise)
    }

    // Step 5: Update gate conditions based on user message
    await this.updateGateConditionsFromMessage(userMessage)

    // Step 6: Crisis Detection Middleware (highest priority)
    const crisisDetected = await this.detectCrisis(userMessage)
    if (crisisDetected) {
      return this.handleCrisisMode()
    }

    // Step 7: State Machine Enforcement
    const validTransitions = this.getValidTransitions()

    // Step 8: Generate AI Response based on current state
    const response = await this.generateContextualResponse(userMessage)

    // Step 9: Update gate conditions based on AI response
    await this.updateGateConditionsFromAIResponse(response.content)

    // Step 10: Exercise Suggestion Gate (if applicable)
    let suggestedExercises: Exercise[] = []
    if (this.shouldCheckExerciseGate(response.newState)) {
      const gateResult = await this.checkExerciseSuggestionGate(userMessage, response.content)
      if (gateResult.passed) {
        suggestedExercises = await this.selectExercises(gateResult.context)
        response.newState = 'EXERCISE_SUGGESTION'
      }
    }

    // Step 11: Validate state transition
    if (!validTransitions.includes(response.newState)) {
      console.warn(`Invalid state transition from ${this.currentState} to ${response.newState}`)
      response.newState = this.currentState // Stay in current state
    }

    return {
      ...response,
      suggestedExercises: suggestedExercises.length > 0 ? suggestedExercises : undefined
    }
  }

  /**
   * Generate response for active exercise with framework context
   */
  private async generateExerciseResponse(userMessage: string, exerciseContext: any): Promise<AIResponse> {
    const exercisePrompt = buildExercisePrompt(exerciseContext)
    
    return await this.generateContextualResponse(userMessage, exercisePrompt)
  }

  /**
   * Extract accepted exercise ID from user message and recent context
   */
  private async extractAcceptedExerciseId(userMessage: string): Promise<string | null> {
    // Look for recent tool results that contain exercise suggestions
    // This is a simplified version - in production, you'd want to track
    // the suggested exercises more explicitly
    
    // For now, check if there are recent messages with exercise data
    const recentMessages = this.recentMessages.slice(-5)
    
    // Look for exercise IDs in assistant messages
    // This assumes the tool results are somehow accessible
    // You may need to adjust based on how you store tool results
    
    // Simplified: Return null for now and let the tool calling handle it
    // In a full implementation, you'd track suggested exercises in conversation state
    return null
  }

  /**
   * Update gate conditions based on user message analysis
   */
  private async updateGateConditionsFromMessage(message: string): Promise<void> {
    const updates: any = {}

    // Condition 1: Check if user articulated a concrete challenge
    if (detectConcreteChallenge(message)) {
      updates.condition1_challengeArticulated = true
      console.log('✅ Gate Condition 1: Concrete challenge detected')
    }

    // Condition 3: Check emotional regulation (absence of dysregulation indicators)
    const dysregulationPatterns = [
      /\b(can't think|mind racing|losing it|falling apart)\b/i,
      /\b(panic|terror|rage|fury)\b/i,
      /[!]{3,}|[?]{3,}/, // Excessive punctuation
      /[A-Z]{5,}/ // Excessive caps
    ]
    
    const isRegulated = !dysregulationPatterns.some(pattern => pattern.test(message))
    updates.condition3_userEmotionallyRegulated = isRegulated
    
    if (!isRegulated) {
      console.log('⚠️  Gate Condition 3: User may not be emotionally regulated')
    }

    if (Object.keys(updates).length > 0) {
      await updateGateConditions(this.conversationId, updates)
    }
  }

  /**
   * Update gate conditions based on AI response analysis
   */
  private async updateGateConditionsFromAIResponse(aiResponse: string): Promise<void> {
    const updates: any = {}

    // Condition 2: Check if AI used reflective language
    if (detectReflectiveLanguage(aiResponse)) {
      updates.condition2_aiReflectedAccurately = true
      console.log('✅ Gate Condition 2: AI reflected user experience')
    }

    // Condition 4: Check if AI explained why structure would help
    const structureExplanationPatterns = [
      /structure (could|might|would) help/i,
      /exercise (could|might|would) (help|support)/i,
      /guided (process|approach|framework)/i,
      /(specific|concrete|structured) (approach|steps|process)/i,
      /work through this (together|systematically)/i
    ]
    
    if (structureExplanationPatterns.some(pattern => pattern.test(aiResponse))) {
      updates.condition4_structureExplained = true
      console.log('✅ Gate Condition 4: AI explained benefit of structure')
    }

    if (Object.keys(updates).length > 0) {
      await updateGateConditions(this.conversationId, updates)
    }
  }

  private async detectCrisis(message: string): Promise<boolean> {
    // Crisis keywords and patterns (simplified - in production would use more sophisticated NLP)
    const crisisPatterns = [
      /\b(suicide|kill myself|end it all|not worth living)\b/i,
      /\b(hurt myself|self harm|cut myself)\b/i,
      /\b(want to die|wish I was dead)\b/i,
      /\b(can't go on|give up|no hope)\b/i,
      /\b(planning to|going to hurt|going to end)\b/i
    ]

    return crisisPatterns.some(pattern => pattern.test(message))
  }

  private handleCrisisMode(): AIResponse {
    const crisisResponse = `I'm really concerned about what you've shared. Your safety is the most important thing right here, right now.

**If you're in immediate danger, please:**
• Call 911 for emergencies
• Call or text 988 for the Suicide & Crisis Lifeline (available 24/7)
• Reach out to a trusted person or mental health professional

I want you to know that these feelings can change, and you don't have to face this alone. There are people trained to help you through this moment.

Would you like me to help you find local crisis resources, or is there someone you can reach out to right now?`

    return {
      content: crisisResponse,
      newState: 'CRISIS_MODE',
      crisisDetected: true,
      metadata: {
        crisisIndicators: ['Crisis language detected in user message']
      }
    }
  }

  private getValidTransitions(): ConversationState[] {
    switch (this.currentState) {
      case 'INIT':
        return ['CONVERSATIONAL_DISCOVERY', 'CRISIS_MODE']
      case 'CONVERSATIONAL_DISCOVERY':
        return ['SUPPORTIVE_PROCESSING', 'EXERCISE_SUGGESTION', 'CRISIS_MODE']
      case 'SUPPORTIVE_PROCESSING':
        return ['CONVERSATIONAL_DISCOVERY', 'EXERCISE_SUGGESTION', 'CRISIS_MODE']
      case 'EXERCISE_SUGGESTION':
        return ['EXERCISE_FACILITATION', 'SUPPORTIVE_PROCESSING', 'CRISIS_MODE']
      case 'EXERCISE_FACILITATION':
        return ['POST_EXERCISE_INTEGRATION', 'CRISIS_MODE']
      case 'POST_EXERCISE_INTEGRATION':
        return ['CONVERSATIONAL_DISCOVERY', 'SUPPORTIVE_PROCESSING', 'CRISIS_MODE']
      case 'CRISIS_MODE':
        return ['CONVERSATIONAL_DISCOVERY', 'SUPPORTIVE_PROCESSING', 'CRISIS_MODE']
      default:
        return ['CONVERSATIONAL_DISCOVERY', 'CRISIS_MODE']
    }
  }

  private async generateContextualResponse(userMessage: string, exercisePromptOverride?: string): Promise<{ content: string; newState: ConversationState }> {
    // Build context for AI
    let context = await this.buildAIContext()
    
    // If exercise prompt provided, append it
    if (exercisePromptOverride) {
      context += '\n\n' + exercisePromptOverride
    }

    // Get user's AI model preference based on subscription
    const model = this.getAIModel()

    // Generate response based on current state
    const statePrompt = this.getStateSpecificPrompt()

    // Use real AI service for generation
    const response = await this.callAIService(userMessage, context, statePrompt)

    return response
  }


  private async buildAIContext(): Promise<string> {
    let context = SYSTEM_PROMPT_V3

    // Add state-specific guidance
    context += `\n\nCurrent conversation state: ${this.currentState}`

    // Add exercise and framework context if in exercise facilitation mode
    if (this.exerciseContext) {
      const { exercise, framework } = this.exerciseContext
      
      // Format framework phases for AI guidance
      const phases = (framework.phases as any[]).map((p: any, idx: number) => 
        `Phase ${idx + 1}: ${p.phase_name || p.name}
   - User Action: ${p.user_action || p.description || 'Engage with the phase content'}
   - AI Role: ${p.ai_role || 'Guide the user through this phase'}
   - Processing: ${p.processing_instruction || p.description || 'Support the user\'s exploration'}`
      ).join('\n\n')

      context += `\n\n═══════════════════════════════════════════════════════
EXERCISE FACILITATION MODE - FRAMEWORK-GUIDED SESSION
═══════════════════════════════════════════════════════

You are conducting the exercise: "${exercise.title}"

EXERCISE FOCUS:
${exercise.aspect}

FRAMEWORK METHODOLOGY: ${framework.name}
${framework.description}

CORE MECHANISM:
${framework.coreMechanism}

THERAPEUTIC BASIS:
${(framework.therapeuticBasis as string[]).join(', ')}

FRAMEWORK PHASES TO GUIDE USER THROUGH:
${phases}

EXERCISE-SPECIFIC GUIDANCE:
${exercise.aiPrompt}

EXPECTED DELIVERABLES (by end of session):
${(framework.deliverables as string[]).slice(0, 5).join('\n')}

FACILITATION APPROACH:
1. Follow the exercise content as your "what" (what you're helping the user work through)
2. Use the framework methodology as your "how" (how to guide them through the process)
3. Move through phases naturally based on where the user is - don't force rigid structure
4. Adapt to the user's emotional/mental state at each step
5. Ask thoughtful, open-ended questions that help them explore
6. Reflect back what you hear to show deep understanding
7. Identify patterns and insights as they emerge
8. Guide toward actionable next steps aligned with the framework

Begin by meeting the user where they are with this issue. Use the framework phases as a guide, not a script.

═══════════════════════════════════════════════════════`
    }

    // Add user baseline profile if available
    if (this.user.baselineProfile) {
      context += `\n\nUser Baseline Profile:
- Primary Intents: ${this.user.baselineProfile.primaryIntents.join(', ')}
- Current Challenges: ${this.user.baselineProfile.currentChallenges.join(', ')}
- Emotional Baseline: ${this.user.baselineProfile.emotionalBaseline.join(', ')}
- Tone Preference: ${this.user.baselineProfile.tonePreference}
- Exercise Openness: ${this.user.baselineProfile.exerciseOpenness}
- Recovery Stage: ${this.user.baselineProfile.recoveryStage || 'Not specified'}
- Substances: ${this.user.baselineProfile.substances.join(', ')}`
    }

    // Add recent conversation history (last 10 messages)
    const recentHistory = this.recentMessages.slice(-10)
    if (recentHistory.length > 0) {
      context += '\n\nRecent Conversation:\n'
      recentHistory.forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`
      })
    }

    return context
  }

  private getAIModel(): string {
    const limits = this.getSubscriptionLimits()
    return limits.aiModels[0] // Use first available model
  }

  private getSubscriptionLimits() {
    switch (this.user.subscriptionTier) {
      case 'FREE':
        return {
          exercisesPerMonth: 5,
          aiModels: ['deepseek-r1'],
          hasJournalAnalysis: false
        }
      case 'PREMIUM':
      case 'INSTITUTION':
        return {
          exercisesPerMonth: -1,
          aiModels: ['deepseek-r1', 'gpt-5.2', 'claude-4.5-opus', 'gemini-3-pro', 'grok-4.1'],
          hasJournalAnalysis: true
        }
      default:
        return {
          exercisesPerMonth: 5,
          aiModels: ['deepseek-r1'],
          hasJournalAnalysis: false
        }
    }
  }

  private getStateSpecificPrompt(): string {
    switch (this.currentState) {
      case 'INIT':
        return 'Greet the user warmly, briefly introduce your role as a supportive guide, and invite them to share what brings them here.'

      case 'CONVERSATIONAL_DISCOVERY':
        return 'Focus on open-ended questions, reflective listening, and clarifying questions. Build rapport and understand the user\'s experience. No imposed structure.'

      case 'SUPPORTIVE_PROCESSING':
        return 'Provide emotional containment, validation, and meaning-making without agenda. Normalize experiences, validate struggle, help articulate inner experience. Avoid solution-driven responses.'

      case 'EXERCISE_SUGGESTION':
        return 'Present 2-3 exercise options maximum. Describe each in plain language, name the therapeutic framework, explicitly reinforce user autonomy.'

      case 'EXERCISE_FACILITATION':
        return 'Follow the selected framework\'s phases precisely. Ask one question at a time, wait for responses, avoid unrelated commentary.'

      case 'POST_EXERCISE_INTEGRATION':
        return 'Summarize key insights, reflect strengths and effort, offer optional gentle next steps.'

      default:
        return 'Listen, understand, and support. You are a guide, not a guru.'
    }
  }

  private async callAIService(
    userMessage: string,
    systemContext: string,
    statePrompt: string
  ): Promise<{ content: string; newState: ConversationState }> {
    try {
      // Get the AI model using Vercel AI SDK
      const model = getModel(this.modelId)

      // Build system prompt with tool capability information
      const systemPrompt = `${systemContext}

## AVAILABLE TOOLS

You have access to the following tool:

**searchExercises(keywords, topic?, framework?, limit?)**
- Use this to search the 634-exercise database
- Call this ONLY after validating all 5 gate conditions:
  1. User has articulated a concrete challenge or pattern
  2. You have accurately reflected their experience
  3. User appears emotionally regulated
  4. You can clearly explain why structure would help
  5. User has not recently declined exercises
- Parameters:
  - keywords: Array of relevant terms (e.g., ["shame", "relapse"])
  - topic: Optional filter (e.g., "Addiction Recovery")
  - framework: Optional filter (e.g., "Trauma Alchemy")
  - limit: Number of exercises to return (default 3, max 5)

When you call this tool:
1. It will return 2-3 relevant exercises
2. Present them to the user with framework names
3. Let the user choose one, request custom, or decline
4. Remember: exercises are invitations, never obligations

[Current State Instructions]: ${statePrompt}

Respond naturally as a compassionate therapeutic guide.`

      // Build messages for Vercel AI SDK
      // Exclude the last message (current user message) since we'll add it separately
      const messages = this.recentMessages.slice(0, -1).slice(-8).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Define the exercise search tool
      const exerciseSearchTool = {
        description: 'Search the therapeutic exercise database to find relevant exercises for the user. Only use this when the user has articulated a concrete challenge and you have validated all 5 gate conditions.',
        parameters: z.object({
          keywords: z.array(z.string()).describe('Keywords related to the user\'s challenge (e.g., ["shame", "relapse", "identity"])'),
          topic: z.string().optional().describe('Specific topic filter (e.g., "Addiction Recovery", "Trauma Processing")'),
          framework: z.string().optional().describe('Specific framework filter (e.g., "Trauma Alchemy", "CBT")'),
          limit: z.number().default(3).describe('Number of exercises to return (default 3, max 5)')
        }),
        // Vercel AI SDK compatibility
        get inputSchema() { return this.parameters },
        execute: async ({ keywords, topic, framework, limit }: {
          keywords: string[]
          topic?: string
          framework?: string
          limit?: number
        }) => {
          console.log('🔧 AI attempting to call searchExercises tool:', { keywords, topic, framework, limit })
          
          // GATE VALIDATION: Check if all conditions are met before allowing search
          const gateStatus = await validateGate(this.conversationId)
          
          if (!gateStatus.allConditionsMet) {
            console.log('🚫 GATE BLOCKED: Cannot search exercises')
            console.log(getGateSummary(gateStatus))
            
            return {
              error: 'Exercise gate conditions not met',
              failedConditions: gateStatus.failedConditions,
              exercises: [],
              count: 0,
              message: 'Continue conversational support. All 5 gate conditions must be met before suggesting exercises.'
            }
          }
          
          console.log('✅ GATE PASSED: All conditions met, proceeding with search')
          
          const exercises = await searchExercises({
            keywords,
            topic,
            framework,
            limit: limit || 3
          })
          
          console.log(`✅ Tool returned ${exercises.length} exercises`)
          
          return {
            exercises: exercises.map(ex => ({
              id: ex.id,
              title: ex.title,
              framework: ex.framework,
              topic: ex.topic,
              aspect: ex.aspect,
              description: ex.aiPrompt.substring(0, 200) + '...' // Brief preview
            })),
            count: exercises.length
          }
        }
      }

      // Generate response using Vercel AI SDK with dynamic model and tools
      const result = await generateText({
        model,
        system: systemPrompt,
        messages: [
          ...messages,
          { role: 'user' as const, content: userMessage }
        ],
        tools: {
          searchExercises: exerciseSearchTool
        },
        temperature: 0.8
      })

      const text = result.text

      // Log tool usage for debugging
      if (result.toolCalls && result.toolCalls.length > 0) {
        console.log('🤖 AI used tools:', result.toolCalls.map(tc => tc.toolName))
        console.log('📊 Tool results:', result.toolResults)
      }

      // Simple state detection - AI stays in current state unless explicitly transitioning
      let newState = this.currentState
      
      // If AI called searchExercises tool, transition to EXERCISE_SUGGESTION
      if (result.toolCalls && result.toolCalls.some(tc => tc.toolName === 'searchExercises')) {
        newState = 'EXERCISE_SUGGESTION'
        console.log('🎯 State transition: EXERCISE_SUGGESTION (AI called searchExercises)')
      } else if (this.currentState === 'CONVERSATIONAL_DISCOVERY') {
        // Basic heuristic for other state transitions
        if (text.toLowerCase().includes('i hear') || 
            text.toLowerCase().includes('that sounds') ||
            text.toLowerCase().includes('it seems like')) {
          newState = 'SUPPORTIVE_PROCESSING'
        }
      }

      return { content: text, newState }
    } catch (error) {
      console.error('AI Service call failed:', error)
      // Fallback to basic response if API fails
      return {
        content: "I'm here to listen and support you. What would be most helpful to talk about right now?",
        newState: this.currentState
      }
    }
  }

  private shouldCheckExerciseGate(newState: ConversationState): boolean {
    return newState === 'SUPPORTIVE_PROCESSING' || newState === 'CONVERSATIONAL_DISCOVERY'
  }

  private async checkExerciseSuggestionGate(userMessage: string, aiResponse: string): Promise<{ passed: boolean; context?: any }> {
    // Use the gate validator to check all 5 conditions
    const gateStatus = await validateGate(this.conversationId)
    
    // Log the gate status
    console.log('🚪 Gate Validation Check:')
    console.log(getGateSummary(gateStatus))
    
    if (!gateStatus.allConditionsMet) {
      console.log('   Failed conditions:', gateStatus.failedConditions)
    }

    return {
      passed: gateStatus.allConditionsMet,
      context: gateStatus.allConditionsMet ? { 
        userMessage, 
        challengeType: this.identifyChallengeType(userMessage),
        gateStatus 
      } : undefined
    }
  }

  private hasConcreteChallenge(message: string): boolean {
    const challengePatterns = [
      /\b(struggling with|having trouble|can't seem to|keep failing|problem with)\b/i,
      /\b(anxious about|worried about|stressed about|overwhelmed by)\b/i,
      /\b(craving|urge to|tempted to|wanting to)\b/i,
      /\b(angry at|frustrated with|disappointed in)\b/i,
      /\b(relationship|work|family|money|health) (problem|issue|challenge)\b/i
    ]

    return challengePatterns.some(pattern => pattern.test(message))
  }

  private isEmotionallyRegulated(message: string): boolean {
    // Check for signs of emotional dysregulation
    const dysregulationPatterns = [
      /\b(can't think|mind racing|losing it|falling apart)\b/i,
      /\b(panic|terror|rage|fury)\b/i,
      /[!]{3,}|[?]{3,}/, // Excessive punctuation
      /[A-Z]{5,}/ // Excessive caps
    ]

    return !dysregulationPatterns.some(pattern => pattern.test(message))
  }

  private async checkRecentDeclines(): Promise<boolean> {
    // Check if user has declined exercises recently
    // This would query the database for recent exercise declinations
    // For now, return true (not declined)
    return true
  }

  private identifyChallengeType(message: string): string {
    if (/\b(craving|urge|tempted|relapse|substance|drink|drug)\b/i.test(message)) {
      return 'addiction_recovery'
    }
    if (/\b(anxious|anxiety|worried|panic|fear)\b/i.test(message)) {
      return 'anxiety'
    }
    if (/\b(angry|rage|frustrated|mad)\b/i.test(message)) {
      return 'anger'
    }
    if (/\b(sad|depressed|hopeless|empty)\b/i.test(message)) {
      return 'depression'
    }
    if (/\b(relationship|partner|family|friend)\b/i.test(message)) {
      return 'relationships'
    }
    return 'general'
  }

  private async selectExercises(context: any): Promise<Exercise[]> {
    const challengeType = context.challengeType
    const userMessage = context.userMessage

    // Extract keywords from user message for better search
    const keywords = this.extractKeywords(userMessage, challengeType)

    console.log('🔍 Searching exercises with keywords:', keywords)

    // Use the exercise search utility
    const exercises = await searchExercises({
      keywords,
      limit: 3
    })

    console.log(`✅ Found ${exercises.length} exercises`)

    return exercises
  }

  private extractKeywords(message: string, challengeType: string): string[] {
    const keywords: string[] = []
    
    // Add challenge type as primary keyword
    keywords.push(challengeType)

    // Common patterns for addiction recovery
    const patterns = {
      shame: /\b(shame|ashamed|embarrassed|guilt)\b/i,
      relapse: /\b(relapse|slip|used|drank)\b/i,
      craving: /\b(craving|urge|tempt|wanting)\b/i,
      anger: /\b(angry|rage|mad|furious)\b/i,
      anxiety: /\b(anxious|anxiety|worried|panic)\b/i,
      trauma: /\b(trauma|ptsd|flashback|triggered)\b/i,
      identity: /\b(identity|who am i|self|purpose)\b/i,
      relationship: /\b(relationship|partner|family|trust)\b/i,
      emotions: /\b(feeling|emotion|overwhelm)\b/i
    }

    // Extract matching keywords
    for (const [keyword, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        keywords.push(keyword)
      }
    }

    return keywords.slice(0, 5) // Limit to 5 keywords
  }
}