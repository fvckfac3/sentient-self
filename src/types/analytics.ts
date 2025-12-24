export interface MoodDataPoint {
  date: string
  mood: number | null
  energy: number | null
}

export interface ExerciseStats {
  total: number
  completed: number
  declined: number
  completionRate: number
}

export interface FrameworkEffectiveness {
  frameworkId: string
  frameworkName: string
  exercisesCompleted: number
  averageMoodBefore: number | null
  averageMoodAfter: number | null
  moodImprovement: number | null
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

export interface AnalyticsSummary {
  moodTrend: MoodDataPoint[]
  exerciseStats: ExerciseStats
  frameworkEffectiveness: FrameworkEffectiveness[]
  streakData: StreakData
  totalJournalEntries: number
  totalConversations: number
  memberSince: string
}
