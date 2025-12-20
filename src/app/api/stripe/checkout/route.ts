import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, getOrCreateStripeCustomer, STRIPE_PREMIUM_PRICE_ID, STRIPE_INSTITUTION_PRICE_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { priceId, plan } = body

    // Validate price ID
    let validPriceId: string | undefined
    if (plan === 'premium' && STRIPE_PREMIUM_PRICE_ID) {
      validPriceId = STRIPE_PREMIUM_PRICE_ID
    } else if (plan === 'institution' && STRIPE_INSTITUTION_PRICE_ID) {
      validPriceId = STRIPE_INSTITUTION_PRICE_ID
    } else if (priceId) {
      validPriceId = priceId
    }

    if (!validPriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or price ID' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email
    )

    // Get the origin for return URLs
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: validPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/chat?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/chat?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan: plan || 'premium',
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
      allow_promotion_codes: true,
    })

    // Return the checkout session URL
    return NextResponse.json(
      { 
        sessionId: checkoutSession.id,
        url: checkoutSession.url 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
