'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Bell,
    ArrowLeft,
    Loader2,
    Mail,
    Smartphone,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

export default function NotificationsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin')
        return null
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Nav />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/settings"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Settings
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-8 w-8 text-orange-500" />
                        <h1 className="text-3xl font-bold">Notifications</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage your notification preferences and reminders
                    </p>
                </motion.div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    Email Notifications
                                </CardTitle>
                                <CardDescription>
                                    Email notifications are currently disabled for privacy
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Sentient Self prioritizes your privacy. We do not send marketing emails
                                    or track your activity outside of the app. Any future notification
                                    features will be opt-in only.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                                    Push Notifications
                                </CardTitle>
                                <CardDescription>
                                    Coming soon
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Optional gentle reminders for journaling and check-ins will be
                                    available in a future update. These will always be opt-in and
                                    designed to support, not pressure.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    Daily Reminders
                                </CardTitle>
                                <CardDescription>
                                    Coming soon
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Set optional daily reminders for journaling, reflection, or
                                    checking in with the AI guide. Designed to support your routine
                                    without creating pressure.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
