import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  return stripeInstance
}

// Lazy-initialized proxy so importing this module never throws at build time.
// The error surfaces only when Stripe is actually used without a key configured.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripeInstance(), prop)
  },
})

// Price IDs from environment
export const STRIPE_PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID
export const STRIPE_INSTITUTION_PRICE_ID = process.env.STRIPE_INSTITUTION_PRICE_ID

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
