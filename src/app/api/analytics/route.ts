import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnalyticsSummary } from '@/lib/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription tier - analytics is premium feature
    const user = session.user as any
    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { error: 'Analytics requires Premium subscription' },
        { status: 403 }
      )
    }

    const analytics = await getAnalyticsSummary(session.user.id)
    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
