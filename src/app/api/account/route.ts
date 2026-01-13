import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/account
 * Immediately and permanently delete a user's account and all associated data.
 * This action is IRREVERSIBLE.
 */
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Delete all user data in the correct order to respect foreign key constraints
        // All these operations cascade from the User model, but being explicit for safety

        await prisma.$transaction(async (tx) => {
            // Delete exercise declinations
            await tx.exerciseDeclination.deleteMany({
                where: { userId }
            })

            // Delete insights first (depends on exercise completions)
            await tx.insight.deleteMany({
                where: { userId }
            })

            // Delete exercise completions
            await tx.exerciseCompletion.deleteMany({
                where: { userId }
            })

            // Delete user streaks
            await tx.userStreak.deleteMany({
                where: { userId }
            })

            // Delete journal entries
            await tx.journalEntry.deleteMany({
                where: { userId }
            })

            // Delete messages through conversations
            const conversations = await tx.conversation.findMany({
                where: { userId },
                select: { id: true }
            })

            for (const conv of conversations) {
                await tx.message.deleteMany({
                    where: { conversationId: conv.id }
                })
            }

            // Delete conversations
            await tx.conversation.deleteMany({
                where: { userId }
            })

            // Delete baseline profile
            await tx.baselineProfile.deleteMany({
                where: { userId }
            })

            // Delete sessions
            await tx.session.deleteMany({
                where: { userId }
            })

            // Delete accounts (OAuth connections)
            await tx.account.deleteMany({
                where: { userId }
            })

            // Finally, delete the user
            await tx.user.delete({
                where: { id: userId }
            })
        })

        return NextResponse.json({
            success: true,
            message: "Account and all associated data have been permanently deleted"
        })
    } catch (error) {
        console.error("Account deletion error:", error)
        return NextResponse.json(
            { error: "Failed to delete account. Please try again or contact support." },
            { status: 500 }
        )
    }
}
