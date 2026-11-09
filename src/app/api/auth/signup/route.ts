import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

import { rateLimit, rateLimitResponse, getClientIp, LIMITS } from '@/lib/rate-limit'
export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  // bcrypt only uses the first 72 bytes
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
  name: z.string().trim().max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit({ key: `signup:${getClientIp(request.headers)}`, ...LIMITS.signup })
    if (!limited.success) {
      return rateLimitResponse(limited, 'Too many sign-up attempts. Please try again later.')
    }

    const body = await request.json()
    
    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (10 rounds as requested)
    const passwordHash = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        subscriptionTier: 'FREE',
        onboardingDone: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        success: true,
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    )
  }
}
