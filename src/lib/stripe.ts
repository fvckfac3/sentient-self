import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Price IDs from environment
export const STRIPE_PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID
export const STRIPE_INSTITUTION_PRICE_ID = process.env.STRIPE_INSTITUTION_PRICE_ID

export type PaidPlan = 'premium' | 'institution'

export function priceIdForPlan(plan: unknown): string | undefined {
  if (plan === 'premium') return STRIPE_PREMIUM_PRICE_ID
  if (plan === 'institution') return STRIPE_INSTITUTION_PRICE_ID
  return undefined
}

/**
 * Tier granted by an active subscription, decided by its price - never by
 * client-supplied metadata. Unknown prices grant nothing.
 */
export function tierForSubscription(subscription: Stripe.Subscription): 'FREE' | 'PREMIUM' | 'INSTITUTION' {
  const priceIds = subscription.items.data.map(item => item.price.id)
  if (STRIPE_INSTITUTION_PRICE_ID && priceIds.includes(STRIPE_INSTITUTION_PRICE_ID)) return 'INSTITUTION'
  if (STRIPE_PREMIUM_PRICE_ID && priceIds.includes(STRIPE_PREMIUM_PRICE_ID)) return 'PREMIUM'
  console.error(`Subscription ${subscription.id} has no known price: ${priceIds.join(', ')}`)
  return 'FREE'
}

// Helper function to get or create a Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { prisma } = await import('@/lib/prisma')
  
  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true }
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  })

  // Save customer ID to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  })

  return customer.id
}
