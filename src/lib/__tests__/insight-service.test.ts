jest.mock('@/lib/prisma')
jest.mock('@/lib/models', () => ({
  getModel: jest.fn(() => 'mock-model'),
}))
jest.mock('ai', () => ({
  generateText: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { generateText } from 'ai'
import { generateInsight, getUserInsights, getInsight } from '../insight-service'

const mockedPrisma = prisma as unknown as {
  insight: {
    findUnique: jest.Mock
    findMany: jest.Mock
    findFirst: jest.Mock
    create: jest.Mock
  }
}
const mockedGenerateText = generateText as jest.Mock

const baseParams = {
  userId: 'user-1',
  exerciseCompletionId: 'completion-1',
  exerciseId: 'exercise-1',
  exerciseTitle: 'Grounding Exercise',
  exerciseFramework: 'CBT',
  reflection: 'I noticed my breathing slow down.',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('generateInsight', () => {
  it('returns the existing insight without generating a new one (immutability)', async () => {
    const existing = { id: 'insight-1', exerciseCompletionId: 'completion-1', synthesis: 'already there' }
    mockedPrisma.insight.findUnique.mockResolvedValue(existing)

    const result = await generateInsight(baseParams)

    expect(result).toBe(existing)
    expect(mockedGenerateText).not.toHaveBeenCalled()
    expect(mockedPrisma.insight.create).not.toHaveBeenCalled()
  })

  it('generates and persists a new insight when none exists', async () => {
    mockedPrisma.insight.findUnique.mockResolvedValue(null)
    mockedGenerateText.mockResolvedValue({
      text: 'You made real progress today.\n\nself-compassion | recognizing triggers',
    })
    const created = { id: 'insight-2', ...baseParams }
    mockedPrisma.insight.create.mockResolvedValue(created)

    const result = await generateInsight(baseParams)

    expect(mockedPrisma.insight.create).toHaveBeenCalledWith({
      data: {
        userId: baseParams.userId,
        exerciseCompletionId: baseParams.exerciseCompletionId,
        exerciseId: baseParams.exerciseId,
        synthesis: 'You made real progress today.',
        annotations: ['self-compassion', 'recognizing triggers'],
      },
    })
    expect(result).toBe(created)
  })

  it('falls back to a default synthesis when AI generation fails', async () => {
    mockedPrisma.insight.findUnique.mockResolvedValue(null)
    mockedGenerateText.mockRejectedValue(new Error('provider timeout'))
    mockedPrisma.insight.create.mockImplementation(({ data }) => Promise.resolve({ id: 'insight-3', ...data }))

    const result = await generateInsight(baseParams)

    expect(result.synthesis).toContain(baseParams.exerciseTitle)
    expect(result.annotations).toEqual(['exercise completion', 'self-reflection'])
  })

  it('filters out overly long or empty annotation phrases', async () => {
    mockedPrisma.insight.findUnique.mockResolvedValue(null)
    const tooLong = 'x'.repeat(60)
    mockedGenerateText.mockResolvedValue({
      text: `Key insight.\n\nself-compassion |  | ${tooLong}`,
    })
    mockedPrisma.insight.create.mockImplementation(({ data }) => Promise.resolve({ id: 'insight-4', ...data }))

    const result = await generateInsight(baseParams)

    expect(result.annotations).toEqual(['self-compassion'])
  })
})

describe('getUserInsights', () => {
  it('queries insights scoped to the user, newest first', async () => {
    mockedPrisma.insight.findMany.mockResolvedValue([])

    await getUserInsights('user-1')

    expect(mockedPrisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      })
    )
  })
})

describe('getInsight', () => {
  it('scopes the lookup to both insight id and owning user', async () => {
    mockedPrisma.insight.findFirst.mockResolvedValue(null)

    await getInsight('insight-1', 'user-1')

    expect(mockedPrisma.insight.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'insight-1', userId: 'user-1' },
      })
    )
  })

  it('returns null when no matching insight is found', async () => {
    mockedPrisma.insight.findFirst.mockResolvedValue(null)

    const result = await getInsight('insight-1', 'user-1')

    expect(result).toBeNull()
  })
})
