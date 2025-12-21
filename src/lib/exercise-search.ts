import { prisma } from './prisma'

export interface ExerciseSearchParams {
  keywords?: string[]
  topic?: string
  framework?: string
  limit?: number
}

export interface ExerciseSearchResult {
  id: string
  title: string
  framework: string
  topic: string | null
  aspect: string
  aiPrompt: string
}

/**
 * Search exercises by keywords, topic, or framework
 * Used by AI to find relevant exercises to suggest to users
 */
export async function searchExercises(
  params: ExerciseSearchParams
): Promise<ExerciseSearchResult[]> {
  const { keywords = [], topic, framework, limit = 3 } = params

  // Build where clause
  const where: any = {}

  // Filter by framework if specified
  if (framework) {
    where.framework = { contains: framework, mode: 'insensitive' }
  }

  // Filter by topic if specified
  if (topic) {
    where.topic = { contains: topic, mode: 'insensitive' }
  }

  // Search across title, aspect, and topic for keywords
  if (keywords.length > 0) {
    where.OR = keywords.flatMap(keyword => [
      { title: { contains: keyword, mode: 'insensitive' } },
      { aspect: { contains: keyword, mode: 'insensitive' } },
      { topic: { contains: keyword, mode: 'insensitive' } }
    ])
  }

  const exercises = await prisma.exercise.findMany({
    where,
    take: limit,
    select: {
      id: true,
      title: true,
      framework: true,
      topic: true,
      aspect: true,
      aiPrompt: true
    }
  })

  return exercises
}

/**
 * Get a single exercise by ID (when user accepts a suggestion)
 */
export async function getExerciseById(id: string) {
  return await prisma.exercise.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      framework: true,
      topic: true,
      aspect: true,
      aiPrompt: true
    }
  })
}

/**
 * Get framework details by ID
 */
export async function getFrameworkById(frameworkId: string) {
  return await prisma.framework.findUnique({
    where: { id: frameworkId },
    select: {
      id: true,
      name: true,
      coreMechanism: true,
      description: true,
      therapeuticBasis: true,
      phases: true,
      deliverables: true,
      bestSuitedFor: true
    }
  })
}

/**
 * Get exercises by topic (for AI to browse options)
 */
export async function getExercisesByTopic(topic: string, limit: number = 5) {
  return await prisma.exercise.findMany({
    where: {
      topic: { contains: topic, mode: 'insensitive' }
    },
    take: limit,
    select: {
      id: true,
      title: true,
      framework: true,
      topic: true,
      aspect: true,
      aiPrompt: true
    }
  })
}

/**
 * Get exercises by framework (for AI to explore framework-specific exercises)
 */
export async function getExercisesByFramework(frameworkId: string, limit: number = 5) {
  return await prisma.exercise.findMany({
    where: {
      framework: frameworkId
    },
    take: limit,
    select: {
      id: true,
      title: true,
      framework: true,
      topic: true,
      aspect: true,
      aiPrompt: true
    }
  })
}

/**
 * Get random exercises (for AI to offer variety)
 */
export async function getRandomExercises(limit: number = 3) {
  // Get total count
  const count = await prisma.exercise.count()
  
  // Generate random offset
  const skip = Math.floor(Math.random() * Math.max(0, count - limit))
  
  return await prisma.exercise.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      framework: true,
      topic: true,
      aspect: true,
      aiPrompt: true
    }
  })
}
