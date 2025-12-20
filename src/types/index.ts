import { User, BaselineProfile, Conversation, Message, Exercise, ExerciseCompletion, JournalEntry, Institution, SubscriptionTier, MessageRole } from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  BaselineProfile,
  Conversation,
  Message,
  Exercise,
  ExerciseCompletion,
  JournalEntry,
  Institution,
  SubscriptionTier,
  MessageRole
} from '@prisma/client'

// Conversation state type for the AI state machine
export type ConversationState =
  | 'INIT'
  | 'CONVERSATIONAL_DISCOVERY'
  | 'SUPPORTIVE_PROCESSING'
  | 'EXERCISE_SUGGESTION'
  | 'EXERCISE_FACILITATION'
  | 'POST_EXERCISE_INTEGRATION'
  | 'CRISIS_MODE'

// Extended types
export interface UserWithProfile extends User {
  baselineProfile?: BaselineProfile | null
}

export interface ConversationWithMessages extends Omit<Conversation, 'state'> {
  messages: Message[]
  state: ConversationState
}

// AI System Types
export interface AIResponse {
  content: string
  state: ConversationState
  suggestedExercises?: Exercise[]
  crisisDetected?: boolean
}

export interface UserBaselineProfile {
  primary_intents: string[]
  current_challenges: string[]
  addiction_context: {
    substances: string[]
    recovery_stage: string
  }
  emotional_baseline: string[]
  support_preferences: {
    tone: string
    exercise_openness: string
  }
  onboarding_completed_at: Date
}

// Exercise Types
export interface ExerciseWithCompletion extends Exercise {
  completions?: ExerciseCompletion[]
}

export interface TherapeuticFramework {
  id: string
  name: string
  description: string
  phases: string[]
}

// Crisis Detection
export interface CrisisIndicators {
  suicidalIdeation: boolean
  selfHarmIntent: boolean
  imminentDanger: boolean
  severeDistress: boolean
}

// Analytics Types
export interface UserAnalytics {
  exerciseAcceptance: number
  exerciseDecline: number
  completionRate: number
  emotionalTrends: Array<{ date: string; mood: number }>
  frameworkEffectiveness: Record<string, number>
}

// Subscription & Billing
export interface SubscriptionLimits {
  exercisesPerMonth: number
  aiModels: string[]
  hasJournalAnalysis: boolean
  hasAnalyticsDashboard: boolean
  hasGamification: boolean
}