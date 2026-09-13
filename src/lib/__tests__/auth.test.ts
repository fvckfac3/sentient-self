jest.mock('@/lib/prisma')
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth'

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock }
}
const mockedCompare = bcrypt.compare as jest.Mock

const credentialsProvider = authOptions.providers.find((p) => p.id === 'credentials') as any
const authorize = credentialsProvider.options.authorize as (
  credentials: Record<string, string> | undefined
) => Promise<unknown>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('credentials authorize', () => {
  it('returns null when email or password is missing', async () => {
    expect(await authorize(undefined)).toBeNull()
    expect(await authorize({ email: 'a@b.com' })).toBeNull()
    expect(await authorize({ password: 'x' })).toBeNull()
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns null when no user matches the email', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null)

    const result = await authorize({ email: 'nobody@example.com', password: 'secret' })

    expect(result).toBeNull()
  })

  it('returns null for an OAuth-only user with no password hash', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: null })

    const result = await authorize({ email: 'a@b.com', password: 'secret' })

    expect(result).toBeNull()
    expect(mockedCompare).not.toHaveBeenCalled()
  })

  it('returns null when the password does not match', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: 'hash' })
    mockedCompare.mockResolvedValue(false)

    const result = await authorize({ email: 'a@b.com', password: 'wrong' })

    expect(result).toBeNull()
  })

  it('returns the user on valid credentials', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      image: null,
      passwordHash: 'hash',
    })
    mockedCompare.mockResolvedValue(true)

    const result = await authorize({ email: 'a@b.com', password: 'correct' })

    expect(result).toEqual({ id: 'u1', email: 'a@b.com', name: 'A', image: null })
  })
})

describe('jwt callback', () => {
  it('stashes the user id on the token at sign-in', async () => {
    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { id: 'u1' },
    } as any)

    expect(token.id).toBe('u1')
  })

  it('leaves an existing token untouched on subsequent calls', async () => {
    const token = await authOptions.callbacks!.jwt!({
      token: { id: 'u1' },
      user: undefined,
    } as any)

    expect(token.id).toBe('u1')
  })
})

describe('session callback', () => {
  it('enriches the session with subscription tier, onboarding status, and model preference', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      subscriptionTier: 'PREMIUM',
      onboardingDone: true,
      preferredModel: 'deepseek-reasoner',
    })

    const session = await authOptions.callbacks!.session!({
      session: { user: {} },
      token: { id: 'u1' },
    } as any)

    expect(session.user.id).toBe('u1')
    expect(session.user.subscriptionTier).toBe('PREMIUM')
    expect(session.user.onboardingDone).toBe(true)
    expect(session.user.preferredModel).toBe('deepseek-reasoner')
  })

  it('sets the id but does not crash when the user no longer exists', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null)

    const session = await authOptions.callbacks!.session!({
      session: { user: {} },
      token: { id: 'deleted-user' },
    } as any)

    expect(session.user.id).toBe('deleted-user')
    expect(session.user.subscriptionTier).toBeUndefined()
  })
})
