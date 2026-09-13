/**
 * @jest-environment node
 */
jest.mock('@/lib/prisma')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedPrisma = prisma as unknown as {
  journalEntry: {
    findMany: jest.Mock
    upsert: jest.Mock
  }
}

function makeRequest(url: string, body?: unknown) {
  return {
    url,
    json: async () => body,
  } as any
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/journal', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const res = await GET(makeRequest('http://localhost/api/journal'))

    expect(res.status).toBe(401)
    expect(mockedPrisma.journalEntry.findMany).not.toHaveBeenCalled()
  })

  it('scopes the query to the current user and applies the default limit', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findMany.mockResolvedValue([])

    await GET(makeRequest('http://localhost/api/journal'))

    expect(mockedPrisma.journalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        take: 50,
      })
    )
  })

  it('applies a date range filter when startDate/endDate are provided', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findMany.mockResolvedValue([])

    await GET(makeRequest('http://localhost/api/journal?startDate=2026-01-01&endDate=2026-01-31&limit=10'))

    expect(mockedPrisma.journalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          date: { gte: new Date('2026-01-01'), lte: new Date('2026-01-31') },
        },
        take: 10,
      })
    )
  })

  it('returns 500 when the database call fails', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findMany.mockRejectedValue(new Error('db down'))

    const res = await GET(makeRequest('http://localhost/api/journal'))

    expect(res.status).toBe(500)
  })
})

describe('POST /api/journal', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const res = await POST(makeRequest('http://localhost/api/journal', { content: 'hello' }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when content is missing', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const res = await POST(makeRequest('http://localhost/api/journal', { content: '   ' }))

    expect(res.status).toBe(400)
    expect(mockedPrisma.journalEntry.upsert).not.toHaveBeenCalled()
  })

  it.each([
    [{ content: 'ok', mood: 0 }],
    [{ content: 'ok', mood: 11 }],
  ])('returns 400 when mood is out of range (%j)', async (body) => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const res = await POST(makeRequest('http://localhost/api/journal', body))

    expect(res.status).toBe(400)
  })

  it.each([
    [{ content: 'ok', energy: 0 }],
    [{ content: 'ok', energy: 11 }],
  ])('returns 400 when energy is out of range (%j)', async (body) => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const res = await POST(makeRequest('http://localhost/api/journal', body))

    expect(res.status).toBe(400)
  })

  it('upserts one entry per day scoped to the current user', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.upsert.mockResolvedValue({ id: 'entry-1' })

    const res = await POST(
      makeRequest('http://localhost/api/journal', {
        date: '2026-03-05T10:00:00.000Z',
        content: 'Today was hard but okay.',
        mood: 6,
      })
    )

    expect(res.status).toBe(201)
    const call = mockedPrisma.journalEntry.upsert.mock.calls[0][0]
    expect(call.where.userId_date.userId).toBe('user-1')
    expect(call.where.userId_date.date.getHours()).toBe(0)
    expect(call.create.content).toBe('Today was hard but okay.')
  })
})
