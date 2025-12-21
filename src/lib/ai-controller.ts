import { ConversationState, Exercise, UserWithProfile } from '@/types'
import { prisma } from '@/lib/prisma'
import { SYSTEM_PROMPT_V3 } from '@/lib/system-prompt'
import { getModel, getDefaultModelForTier, type ModelId } from '@/lib/models'
import { generateText } from 'ai'

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

    // Step 1: Crisis Detection Middleware (highest priority)
    const crisisDetected = await this.detectCrisis(userMessage)
    if (crisisDetected) {
      return this.handleCrisisMode()
    }

    // Step 2: State Machine Enforcement
    const validTransitions = this.getValidTransitions()

    // Step 3: Generate AI Response based on current state
    const response = await this.generateContextualResponse(userMessage)

    // Step 4: Exercise Suggestion Gate (if applicable)
    let suggestedExercises: Exercise[] = []
    if (this.shouldCheckExerciseGate(response.newState)) {
      const gateResult = await this.checkExerciseSuggestionGate(userMessage, response.content)
      if (gateResult.passed) {
        suggestedExercises = await this.selectExercises(gateResult.context)
        response.newState = 'EXERCISE_SUGGESTION'
      }
    }

    // Step 5: Validate state transition
    if (!validTransitions.includes(response.newState)) {
      console.warn(`Invalid state transition from ${this.currentState} to ${response.newState}`)
      response.newState = this.currentState // Stay in current state
    }

    return {
      ...response,
      suggestedExercises: suggestedExercises.length > 0 ? suggestedExercises : undefined
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

  private async generateContextualResponse(userMessage: string): Promise<{ content: string; newState: ConversationState }> {
    // Build context for AI
    const context = await this.buildAIContext()

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

      // Build system prompt
      const systemPrompt = `${systemContext}\n\n[Current State Instructions]: ${statePrompt}\n\nRespond naturally as a compassionate therapeutic guide.`

      // Build messages for Vercel AI SDK
      // Exclude the last message (current user message) since we'll add it separately
      const messages = this.recentMessages.slice(0, -1).slice(-8).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Generate response using Vercel AI SDK with dynamic model
      const { text } = await generateText({
        model,
        system: systemPrompt,
        messages: [
          ...messages,
          { role: 'user' as const, content: userMessage }
        ],
        temperature: 0.8,
      })

      // Simple state detection - AI stays in current state unless explicitly transitioning
      let newState = this.currentState
      
      // Basic heuristic for state transitions
      if (this.currentState === 'CONVERSATIONAL_DISCOVERY') {
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
    // The 5 mandatory conditions from the documentation:
    // 1. A concrete challenge or pattern has been articulated
    // 2. The AI has accurately reflected the challenge
    // 3. The user appears emotionally regulated
    // 4. The AI can explain why structure would help
    // 5. The user has not recently declined exercises

    const conditions = {
      concreteChallenge: this.hasConcreteChallenge(userMessage),
      accurateReflection: true, // Simplified - would need more sophisticated analysis
      emotionallyRegulated: this.isEmotionallyRegulated(userMessage),
      canExplainStructure: true, // Simplified
      notRecentlyDeclined: await this.checkRecentDeclines()
    }

    const allPassed = Object.values(conditions).every(Boolean)

    return {
      passed: allPassed,
      context: allPassed ? { userMessage, challengeType: this.identifyChallengeType(userMessage) } : undefined
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

    // Query exercises based on challenge type and user's framework preferences
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { topic: { contains: challengeType, mode: 'insensitive' } },
          { aspect: { contains: challengeType, mode: 'insensitive' } }
        ]
      },
      take: 3 // Maximum 3 exercises as per documentation
    })

    return exercises
  }
}