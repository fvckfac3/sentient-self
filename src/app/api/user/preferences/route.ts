import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT /api/user/preferences
 * Update user preferences (preferred AI model, etc.)
 */
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { preferredModel } = body

        // Validate the model ID
        const validModels = [
            'deepseek-chat',
            'gpt-4o',
            'gpt-4o-mini',
            'claude-3-5-sonnet-20241022',
            'claude-3-opus-20240229',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
        ]

        if (preferredModel && !validModels.includes(preferredModel)) {
            return NextResponse.json({ error: "Invalid model ID" }, { status: 400 })
        }

        // Check if user can use premium models
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true }
        })

        const premiumModels = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'gemini-1.5-pro', 'gemini-1.5-flash']
        const isPremiumModel = premiumModels.includes(preferredModel)
        const canUsePremium = user?.subscriptionTier === 'PREMIUM' || user?.subscriptionTier === 'INSTITUTION'

        if (isPremiumModel && !canUsePremium) {
            return NextResponse.json({ error: "Premium subscription required for this model" }, { status: 403 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { preferredModel },
            select: { preferredModel: true }
        })

        return NextResponse.json({
            success: true,
            preferredModel: updatedUser.preferredModel
        })
    } catch (error) {
        console.error("Update preferences error:", error)
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }
}

/**
 * GET /api/user/preferences
 * Get current user preferences
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                preferredModel: true,
                subscriptionTier: true
            }
        })

        return NextResponse.json({
            preferredModel: user?.preferredModel || 'deepseek-chat',
            subscriptionTier: user?.subscriptionTier || 'FREE'
        })
    } catch (error) {
        console.error("Get preferences error:", error)
        return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 })
    }
}
