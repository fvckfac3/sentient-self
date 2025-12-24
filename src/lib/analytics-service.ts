import { prisma } from './prisma'
import { 
  AnalyticsSummary, 
  MoodDataPoint, 
  ExerciseStats, 
  FrameworkEffectiveness,
  StreakData 
} from '@/types/analytics'

/**
 * Get mood trend data for the last N days
 */
export async function getMoodTrend(
  userId: string, 
  days: number = 30
): Promise<MoodDataPoint[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: startDate }
    },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      mood: true,
      energy: true
    }
  })

  return entries.map(entry => ({
    date: entry.date.toISOString().split('T')[0],
    mood: entry.mood,
    energy: entry.energy
  }))
}

/**
 * Get exercise statistics
 */
export async function getExerciseStats(userId: string): Promise<ExerciseStats> {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    select: {
      exercisesCompleted: true,
      gateCondition5_noRecentDecline: true,
      lastDeclinedAt: true
    }
  })

  const total = conversations.reduce((sum, c) => sum + c.exercisesCompleted, 0)
  const declined = conversations.filter(c => c.lastDeclinedAt !== null).length
  const completed = total
  const completionRate = total > 0 ? (completed / (completed + declined)) * 100 : 0

  return {
    total: completed + declined,
    completed,
    declined,
    completionRate: Math.round(completionRate)
  }
}

/**
 * Get framework effectiveness data
 */
export async function getFrameworkEffectiveness(
  userId: string
): Promise<FrameworkEffectiveness[]> {
  // Get all frameworks
  const frameworks = await prisma.framework.findMany({
    select: {
      id: true,
      name: true
    }
  })

  // Get completed exercises by framework
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      exercisesCompleted: { gt: 0 }
    },
    select: {
      activeFrameworkId: true,
      exercisesCompleted: true
    }
  })

  // Aggregate by framework
  const frameworkStats = new Map<string, number>()
  conversations.forEach(conv => {
    if (conv.activeFrameworkId) {
      const current = frameworkStats.get(conv.activeFrameworkId) || 0
      frameworkStats.set(conv.activeFrameworkId, current + conv.exercisesCompleted)
    }
  })

  return frameworks
    .map(fw => ({
      frameworkId: fw.id,
      frameworkName: fw.name,
      exercisesCompleted: frameworkStats.get(fw.id) || 0,
      averageMoodBefore: null, // TODO: Track mood before/after exercises
      averageMoodAfter: null,
      moodImprovement: null
    }))
    .filter(fw => fw.exercisesCompleted > 0)
    .sort((a, b) => b.exercisesCompleted - a.exercisesCompleted)
}

/**
 * Calculate streak data
 */
export async function getStreakData(userId: string): Promise<StreakData> {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true }
  })

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  // Combine activity dates
  const activityDates = new Set<string>()
  entries.forEach(e => activityDates.add(e.date.toISOString().split('T')[0]))
  conversations.forEach(c => activityDates.add(c.createdAt.toISOString().split('T')[0]))

  const sortedDates = Array.from(activityDates).sort().reverse()

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  // Calculate current streak
  let currentStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Check if there's activity today or yesterday (streak is still active)
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1
    let checkDate = new Date(sortedDates[0])
    
    for (let i = 1; i < sortedDates.length; i++) {
      checkDate.setDate(checkDate.getDate() - 1)
      const expectedDate = checkDate.toISOString().split('T')[0]
      
      if (sortedDates[i] === expectedDate) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: sortedDates[0]
  }
}

/**
 * Get full analytics summary
 */
export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  })

  const [moodTrend, exerciseStats, frameworkEffectiveness, streakData] = await Promise.all([
    getMoodTrend(userId, 30),
    getExerciseStats(userId),
    getFrameworkEffectiveness(userId),
    getStreakData(userId)
  ])

  const totalJournalEntries = await prisma.journalEntry.count({
    where: { userId }
  })

  const totalConversations = await prisma.conversation.count({
    where: { userId }
  })

  return {
    moodTrend,
    exerciseStats,
    frameworkEffectiveness,
    streakData,
    totalJournalEntries,
    totalConversations,
    memberSince: user?.createdAt.toISOString() || new Date().toISOString()
  }
}
