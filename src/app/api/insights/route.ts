import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserInsights } from "@/lib/insight-service"

/**
 * GET /api/insights
 * Get all insights for the current user
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const insights = await getUserInsights(session.user.id)

        return NextResponse.json({ insights })
    } catch (error) {
        console.error("Fetch insights error:", error)
        return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
    }
}
