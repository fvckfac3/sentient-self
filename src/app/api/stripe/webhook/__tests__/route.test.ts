/**
 * @jest-environment node
 */
jest.mock('@/lib/prisma')
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn() },
  },
}))

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { POST } from '../route'

const mockedHeaders = headers as jest.Mock
const mockedConstructEvent = stripe.webhooks.constructEvent as jest.Mock
const mockedRetrieveSubscription = stripe.subscriptions.retrieve as jest.Mock
const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock }
}

function makeRequest(body: string) {
  return { text: async () => body } as any
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedHeaders.mockReturnValue({ get: () => 'sig_test' })
})

it('returns 400 when the Stripe signature is missing', async () => {
  mockedHeaders.mockReturnValue({ get: () => null })

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(400)
})

it('returns 400 when signature verification fails', async () => {
  mockedConstructEvent.mockImplementation(() => {
    throw new Error('bad signature')
  })

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(400)
})

it('grants the institution tier on checkout completion for an institution plan', async () => {
  mockedConstructEvent.mockReturnValue({
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: { userId: 'user-1', plan: 'institution' },
        customer: 'cus_1',
        subscription: 'sub_1',
      },
    },
  })
  mockedRetrieveSubscription.mockResolvedValue({ id: 'sub_1' })
  mockedPrisma.user.update.mockResolvedValue({})

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(200)
  expect(mockedPrisma.user.update).toHaveBeenCalledWith({
    where: { id: 'user-1' },
    data: {
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      subscriptionTier: 'INSTITUTION',
    },
  })
})

it('preserves the institution tier on subscription.updated instead of defaulting to premium', async () => {
  // Regression test: subscription-level metadata must carry `plan` (set at checkout
  // time via subscription_data.metadata) so renewal/status-change events don't
  // silently downgrade an institution subscriber to PREMIUM.
  mockedConstructEvent.mockReturnValue({
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'active',
        metadata: { userId: 'user-1', plan: 'institution' },
      },
    },
  })
  mockedPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' })
  mockedPrisma.user.update.mockResolvedValue({})

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(200)
  expect(mockedPrisma.user.update).toHaveBeenCalledWith({
    where: { id: 'user-1' },
    data: {
      stripeSubscriptionId: 'sub_1',
      subscriptionTier: 'INSTITUTION',
    },
  })
})

it('downgrades to FREE when a subscription is canceled', async () => {
  mockedConstructEvent.mockReturnValue({
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'canceled',
        metadata: { userId: 'user-1', plan: 'institution' },
      },
    },
  })
  mockedPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' })
  mockedPrisma.user.update.mockResolvedValue({})

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(200)
  expect(mockedPrisma.user.update).toHaveBeenCalledWith({
    where: { id: 'user-1' },
    data: {
      stripeSubscriptionId: 'sub_1',
      subscriptionTier: 'FREE',
    },
  })
})

it('downgrades to FREE on subscription deletion', async () => {
  mockedConstructEvent.mockReturnValue({
    type: 'customer.subscription.deleted',
    data: {
      object: { id: 'sub_1', customer: 'cus_1' },
    },
  })
  mockedPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' })
  mockedPrisma.user.update.mockResolvedValue({})

  const res = await POST(makeRequest('{}'))

  expect(res.status).toBe(200)
  expect(mockedPrisma.user.update).toHaveBeenCalledWith({
    where: { id: 'user-1' },
    data: {
      stripeSubscriptionId: null,
      subscriptionTier: 'FREE',
    },
  })
})
