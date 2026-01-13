'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
    TrendingUp,
    Calendar,
    Sparkles,
    ChevronRight,
    Loader2,
    BookOpen,
    Target,
    Heart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

interface Insight {
    id: string
    synthesis: string
    annotations: string[]
    createdAt: string
    exerciseCompletion: {
        exercise: {
            title: string
            framework: string
            topic: string | null
        }
        completedAt: string
        reflection: string
    }
}

export default function ProgressPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [insights, setInsights] = useState<Insight[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user?.id) {
            fetchInsights()
        }
    }, [session?.user?.id])

    const fetchInsights = async () => {
        try {
            const response = await fetch('/api/insights')
            if (!response.ok) throw new Error('Failed to fetch insights')
            const data = await response.json()
            setInsights(data.insights || [])
        } catch (err) {
            setError('Unable to load your progress. Please try again.')
            console.error('Error fetching insights:', err)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Group insights by month
    const groupedInsights = insights.reduce((acc, insight) => {
        const monthKey = format(new Date(insight.createdAt), 'MMMM yyyy')
        if (!acc[monthKey]) acc[monthKey] = []
        acc[monthKey].push(insight)
        return acc
    }, {} as Record<string, Insight[]>)

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Nav />

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Your Progress</h1>
                    </div>
                    <p className="text-muted-foreground">
                        A timeline of insights from your completed exercises
                    </p>
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{insights.length}</p>
                                    <p className="text-sm text-muted-foreground">Exercises Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{insights.length}</p>
                                    <p className="text-sm text-muted-foreground">Insights Generated</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 col-span-2 md:col-span-1">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Heart className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {new Set(insights.flatMap(i => i.annotations)).size}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Unique Themes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {error && (
                    <Card className="border-destructive/50 mb-6">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {insights.length === 0 && !error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-dashed">
                            <CardContent className="py-12 text-center">
                                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Complete exercises through the AI chat to generate insights
                                </p>
                                <Link
                                    href="/chat"
                                    className="inline-flex items-center gap-2 text-primary hover:underline"
                                >
                                    Start a conversation
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedInsights).map(([month, monthInsights], monthIndex) => (
                            <motion.div
                                key={month}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (monthIndex + 1) }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="text-sm font-medium text-muted-foreground">{month}</h2>
                                </div>

                                <div className="space-y-4 border-l-2 border-border pl-4 ml-2">
                                    {monthInsights.map((insight, index) => (
                                        <motion.div
                                            key={insight.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                        >
                                            <Link href={`/progress/${insight.id}`}>
                                                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <CardTitle className="text-base">
                                                                    {insight.exerciseCompletion.exercise.title}
                                                                </CardTitle>
                                                                <CardDescription className="text-xs">
                                                                    {insight.exerciseCompletion.exercise.framework} •{' '}
                                                                    {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
                                                                </CardDescription>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                            {insight.synthesis}
                                                        </p>
                                                        {insight.annotations.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {insight.annotations.slice(0, 3).map((annotation, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                                                    >
                                                                        {annotation}
                                                                    </span>
                                                                ))}
                                                                {insight.annotations.length > 3 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        +{insight.annotations.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
