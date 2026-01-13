import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getInsight } from "@/lib/insight-service"

/**
 * GET /api/insights/[id]
 * Get a specific insight by ID
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const insight = await getInsight(params.id, session.user.id)

        if (!insight) {
            return NextResponse.json({ error: "Insight not found" }, { status: 404 })
        }

        return NextResponse.json({ insight })
    } catch (error) {
        console.error("Fetch insight error:", error)
        return NextResponse.json({ error: "Failed to fetch insight" }, { status: 500 })
    }
}
