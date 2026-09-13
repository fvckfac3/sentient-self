/**
 * @jest-environment node
 */
jest.mock('@/lib/prisma')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET, PUT, DELETE } from '../route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedPrisma = prisma as unknown as {
  journalEntry: {
    findUnique: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
}

function makeRequest(url: string, body?: unknown) {
  return {
    url,
    json: async () => body,
  } as any
}

const ctx = { params: { id: 'entry-1' } }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/journal/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const res = await GET(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(401)
  })

  it('returns 404 when the entry does not exist', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue(null)

    const res = await GET(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(404)
  })

  it('returns 403 when the entry belongs to a different user', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'someone-else' })

    const res = await GET(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(403)
  })

  it('returns the entry when the owner requests it', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'user-1' })

    const res = await GET(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(200)
  })
})

describe('PUT /api/journal/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const res = await PUT(makeRequest('http://localhost/api/journal/entry-1', {}), ctx)

    expect(res.status).toBe(401)
  })

  it('returns 404 when the entry does not exist', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue(null)

    const res = await PUT(makeRequest('http://localhost/api/journal/entry-1', {}), ctx)

    expect(res.status).toBe(404)
  })

  it('returns 403 when a non-owner tries to update the entry', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'someone-else' })

    const res = await PUT(makeRequest('http://localhost/api/journal/entry-1', { content: 'hacked' }), ctx)

    expect(res.status).toBe(403)
    expect(mockedPrisma.journalEntry.update).not.toHaveBeenCalled()
  })

  it('returns 400 when mood is out of range', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'user-1' })

    const res = await PUT(makeRequest('http://localhost/api/journal/entry-1', { mood: 99 }), ctx)

    expect(res.status).toBe(400)
  })

  it('only writes the fields explicitly provided in the body', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'user-1' })
    mockedPrisma.journalEntry.update.mockResolvedValue({ id: 'entry-1', content: 'updated' })

    const res = await PUT(makeRequest('http://localhost/api/journal/entry-1', { content: 'updated' }), ctx)

    expect(res.status).toBe(200)
    expect(mockedPrisma.journalEntry.update).toHaveBeenCalledWith({
      where: { id: 'entry-1' },
      data: { content: 'updated' },
    })
  })
})

describe('DELETE /api/journal/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const res = await DELETE(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(401)
  })

  it('returns 403 when a non-owner tries to delete the entry', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'someone-else' })

    const res = await DELETE(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(403)
    expect(mockedPrisma.journalEntry.delete).not.toHaveBeenCalled()
  })

  it('deletes the entry when the owner requests it', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockedPrisma.journalEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'user-1' })
    mockedPrisma.journalEntry.delete.mockResolvedValue({ id: 'entry-1' })

    const res = await DELETE(makeRequest('http://localhost/api/journal/entry-1'), ctx)

    expect(res.status).toBe(200)
    expect(mockedPrisma.journalEntry.delete).toHaveBeenCalledWith({ where: { id: 'entry-1' } })
  })
})
