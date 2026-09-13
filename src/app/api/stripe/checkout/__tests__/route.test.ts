/**
 * @jest-environment node
 */
jest.mock('@/lib/prisma')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))
jest.mock('@/lib/stripe', () => ({
  stripe: { checkout: { sessions: { create: jest.fn() } } },
  getOrCreateStripeCustomer: jest.fn(),
  STRIPE_PREMIUM_PRICE_ID: 'price_premium_123',
  STRIPE_INSTITUTION_PRICE_ID: 'price_institution_456',
}))

import { getServerSession } from 'next-auth'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe'
import { POST } from '../route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedCreate = stripe.checkout.sessions.create as jest.Mock
const mockedGetOrCreateCustomer = getOrCreateStripeCustomer as jest.Mock

function makeRequest(body: unknown) {
  return {
    headers: new Headers(),
    json: async () => body,
  } as any
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.com' } })
  mockedGetOrCreateCustomer.mockResolvedValue('cus_1')
  mockedCreate.mockResolvedValue({ id: 'cs_1', url: 'https://stripe.test/checkout' })
})

it('returns 401 when there is no session', async () => {
  mockedGetServerSession.mockResolvedValue(null)

  const res = await POST(makeRequest({ plan: 'premium' }))

  expect(res.status).toBe(401)
})

it('rejects an unrecognized priceId even when a plan name is not supplied', async () => {
  const res = await POST(makeRequest({ priceId: 'price_totally_made_up' }))

  expect(res.status).toBe(400)
  expect(mockedCreate).not.toHaveBeenCalled()
})

it('derives the granted plan from the actual price charged, not an arbitrary client-supplied plan string', async () => {
  // No recognized `plan` name given, only a priceId. Before the fix, an unrecognized
  // priceId was accepted as-is and the raw (unvalidated) `plan` string was written
  // straight into metadata — letting a client decouple what it pays from what tier
  // it's granted whenever a plan name didn't hit the two known-price branches.
  const res = await POST(makeRequest({ priceId: 'price_premium_123', plan: 'anything-a-client-could-type' }))

  expect(res.status).toBe(200)
  const call = mockedCreate.mock.calls[0][0]
  expect(call.line_items[0].price).toBe('price_premium_123')
  expect(call.metadata.plan).toBe('premium')
  expect(call.subscription_data.metadata.plan).toBe('premium')
})

it('creates a checkout session for a known plan name and stamps plan onto subscription metadata', async () => {
  const res = await POST(makeRequest({ plan: 'institution' }))

  expect(res.status).toBe(200)
  const call = mockedCreate.mock.calls[0][0]
  expect(call.line_items[0].price).toBe('price_institution_456')
  expect(call.metadata.plan).toBe('institution')
  // Regression guard: subscription-level metadata must carry the plan too, so that
  // customer.subscription.updated webhooks (which only see the subscription, not the
  // checkout session) can still resolve the correct tier.
  expect(call.subscription_data.metadata.plan).toBe('institution')
  expect(call.subscription_data.metadata.userId).toBe('user-1')
})

it('returns 500 when Stripe session creation fails', async () => {
  mockedCreate.mockRejectedValue(new Error('stripe down'))

  const res = await POST(makeRequest({ plan: 'premium' }))

  expect(res.status).toBe(500)
})
