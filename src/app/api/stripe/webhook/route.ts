import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment succeeded for invoice: ${invoice.id}`)
        // Additional handling if needed
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment failed for invoice: ${invoice.id}`)
        // Handle failed payment (e.g., notify user, downgrade)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session completion
 * Upgrades user to PREMIUM tier and stores subscription info
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const userId = session.metadata?.userId
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (!userId) {
      console.error('No userId in checkout session metadata')
      return
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Determine tier based on subscription
    let tier: 'FREE' | 'PREMIUM' | 'INSTITUTION' = 'PREMIUM'
    if (session.metadata?.plan === 'institution') {
      tier = 'INSTITUTION'
    }

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionTier: tier,
      },
    })

    console.log(`User ${userId} upgraded to ${tier} tier`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
    throw error
  }
}

/**
 * Handle subscription updates
 * Updates user tier based on subscription status
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const subscriptionId = subscription.id

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`)
      return
    }

    // Determine tier based on subscription status
    let tier: 'FREE' | 'PREMIUM' | 'INSTITUTION' = 'FREE'

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // Check metadata or price to determine plan type
      const plan = subscription.metadata?.plan
      if (plan === 'institution') {
        tier = 'INSTITUTION'
      } else {
        tier = 'PREMIUM'
      }
    } else if (
      subscription.status === 'canceled' ||
      subscription.status === 'unpaid' ||
      subscription.status === 'past_due'
    ) {
      tier = 'FREE'
    }

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionTier: tier,
      },
    })

    console.log(
      `User ${user.id} subscription updated: ${subscription.status} -> ${tier}`
    )
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

/**
 * Handle subscription deletion
 * Downgrades user to FREE tier
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`)
      return
    }

    // Downgrade to FREE tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: null,
        subscriptionTier: 'FREE',
      },
    })

    console.log(`User ${user.id} subscription deleted, downgraded to FREE`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}
