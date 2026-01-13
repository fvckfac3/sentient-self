import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/export
 * Export all user data as JSON.
 * Query param: format=json|csv (default: json)
 * 
 * Per PRD: Excludes raw AI conversation messages for privacy.
 * Includes: profile, journal entries, exercise completions, baseline profile
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const userId = session.user.id

        // Fetch all user data
        const [user, baselineProfile, journalEntries, exerciseCompletions, streaks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    subscriptionTier: true,
                    onboardingDone: true,
                    disclaimerAcknowledgedAt: true,
                    preferredModel: true,
                }
            }),
            prisma.baselineProfile.findUnique({
                where: { userId },
                select: {
                    primaryIntents: true,
                    currentChallenges: true,
                    emotionalBaseline: true,
                    tonePreference: true,
                    exerciseOpenness: true,
                    recoveryStage: true,
                    substances: true,
                    createdAt: true,
                }
            }),
            prisma.journalEntry.findMany({
                where: { userId },
                select: {
                    id: true,
                    date: true,
                    mood: true,
                    energy: true,
                    content: true,
                    gratitude: true,
                    goals: true,
                    insights: true,
                    createdAt: true,
                },
                orderBy: { date: 'desc' }
            }),
            prisma.exerciseCompletion.findMany({
                where: { userId },
                select: {
                    id: true,
                    exerciseId: true,
                    reflection: true,
                    completedAt: true,
                    exercise: {
                        select: {
                            title: true,
                            framework: true,
                            topic: true,
                        }
                    }
                },
                orderBy: { completedAt: 'desc' }
            }),
            prisma.userStreak.findMany({
                where: { userId },
                select: {
                    streakType: true,
                    currentStreak: true,
                    longestStreak: true,
                    lastActivityAt: true,
                }
            })
        ])

        const exportData = {
            exportedAt: new Date().toISOString(),
            user,
            baselineProfile,
            journalEntries,
            exerciseCompletions: exerciseCompletions.map(ec => ({
                id: ec.id,
                exerciseId: ec.exerciseId,
                exerciseTitle: ec.exercise.title,
                exerciseFramework: ec.exercise.framework,
                exerciseTopic: ec.exercise.topic,
                reflection: ec.reflection,
                completedAt: ec.completedAt,
            })),
            streaks,
            // Note: Raw conversation messages excluded per privacy PRD
            _privacyNote: "Raw AI conversation messages are excluded from export for privacy."
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csvData = convertToCSV(exportData)

            return new NextResponse(csvData, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="sentient-self-export-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            })
        }

        // Default: JSON format
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="sentient-self-export-${new Date().toISOString().split('T')[0]}.json"`,
            },
        })
    } catch (error) {
        console.error("Data export error:", error)
        return NextResponse.json(
            { error: "Failed to export data. Please try again." },
            { status: 500 }
        )
    }
}

/**
 * Convert export data to CSV format
 * Creates multiple sections for different data types
 */
function convertToCSV(data: any): string {
    const lines: string[] = []

    // Header
    lines.push('# Sentient Self Data Export')
    lines.push(`# Exported: ${data.exportedAt}`)
    lines.push('')

    // User Profile
    lines.push('## USER PROFILE')
    lines.push('Field,Value')
    if (data.user) {
        lines.push(`Email,${escapeCSV(data.user.email)}`)
        lines.push(`Name,${escapeCSV(data.user.name || '')}`)
        lines.push(`Created At,${data.user.createdAt}`)
        lines.push(`Subscription,${data.user.subscriptionTier}`)
        lines.push(`Onboarding Done,${data.user.onboardingDone}`)
        lines.push(`Disclaimer Acknowledged,${data.user.disclaimerAcknowledgedAt || 'No'}`)
    }
    lines.push('')

    // Baseline Profile
    if (data.baselineProfile) {
        lines.push('## BASELINE PROFILE')
        lines.push('Field,Value')
        lines.push(`Primary Intents,${escapeCSV(data.baselineProfile.primaryIntents?.join('; ') || '')}`)
        lines.push(`Current Challenges,${escapeCSV(data.baselineProfile.currentChallenges?.join('; ') || '')}`)
        lines.push(`Emotional Baseline,${escapeCSV(data.baselineProfile.emotionalBaseline?.join('; ') || '')}`)
        lines.push(`Tone Preference,${escapeCSV(data.baselineProfile.tonePreference || '')}`)
        lines.push(`Exercise Openness,${escapeCSV(data.baselineProfile.exerciseOpenness || '')}`)
        lines.push(`Recovery Stage,${escapeCSV(data.baselineProfile.recoveryStage || '')}`)
        lines.push('')
    }

    // Journal Entries
    lines.push('## JOURNAL ENTRIES')
    lines.push('Date,Mood,Energy,Content,Gratitude,Goals,AI Insights')
    for (const entry of data.journalEntries || []) {
        lines.push([
            entry.date,
            entry.mood || '',
            entry.energy || '',
            escapeCSV(entry.content || ''),
            escapeCSV(entry.gratitude || ''),
            escapeCSV(entry.goals || ''),
            escapeCSV(entry.insights || ''),
        ].join(','))
    }
    lines.push('')

    // Exercise Completions
    lines.push('## EXERCISE COMPLETIONS')
    lines.push('Date,Exercise,Framework,Topic,Reflection')
    for (const ec of data.exerciseCompletions || []) {
        lines.push([
            ec.completedAt,
            escapeCSV(ec.exerciseTitle || ''),
            escapeCSV(ec.exerciseFramework || ''),
            escapeCSV(ec.exerciseTopic || ''),
            escapeCSV(ec.reflection || ''),
        ].join(','))
    }
    lines.push('')

    // Streaks
    lines.push('## STREAKS')
    lines.push('Type,Current,Longest,Last Activity')
    for (const streak of data.streaks || []) {
        lines.push([
            streak.streakType,
            streak.currentStreak,
            streak.longestStreak,
            streak.lastActivityAt,
        ].join(','))
    }

    lines.push('')
    lines.push('# Note: Raw AI conversation messages are excluded for privacy.')

    return lines.join('\n')
}

function escapeCSV(value: string): string {
    if (!value) return ''
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}
