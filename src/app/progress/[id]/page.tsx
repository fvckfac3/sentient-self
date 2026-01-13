'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    ArrowLeft,
    Sparkles,
    Calendar,
    BookOpen,
    Tag,
    Loader2,
    Quote
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
            aspect: string
        }
        completedAt: string
        reflection: string
    }
}

export default function InsightDetailPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [insight, setInsight] = useState<Insight | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user?.id && params.id) {
            fetchInsight()
        }
    }, [session?.user?.id, params.id])

    const fetchInsight = async () => {
        try {
            const response = await fetch(`/api/insights/${params.id}`)
            if (!response.ok) {
                if (response.status === 404) {
                    setError('Insight not found')
                } else {
                    throw new Error('Failed to fetch insight')
                }
                return
            }
            const data = await response.json()
            setInsight(data.insight)
        } catch (err) {
            setError('Unable to load this insight. Please try again.')
            console.error('Error fetching insight:', err)
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

    if (error || !insight) {
        return (
            <div className="min-h-screen relative">
                <AnimatedBackground />
                <Nav />
                <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                    <Link
                        href="/progress"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Progress
                    </Link>
                    <Card className="border-destructive/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-destructive">{error || 'Insight not found'}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Nav />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href="/progress"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Progress
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(insight.createdAt), 'MMMM d, yyyy')}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {insight.exerciseCompletion.exercise.title}
                        </h1>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {insight.exerciseCompletion.exercise.framework}
                            </span>
                            {insight.exerciseCompletion.exercise.topic && (
                                <span className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    {insight.exerciseCompletion.exercise.topic}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Synthesis Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Key Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground leading-relaxed">{insight.synthesis}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Annotations */}
                {insight.annotations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Themes & Patterns</CardTitle>
                                <CardDescription>Key themes identified in this exercise</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {insight.annotations.map((annotation, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
                                        >
                                            {annotation}
                                        </motion.span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Original Reflection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Quote className="h-5 w-5 text-muted-foreground" />
                                Your Reflection
                            </CardTitle>
                            <CardDescription>Your original response during the exercise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary/30">
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {insight.exerciseCompletion.reflection}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
