'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Sparkles,
    ArrowLeft,
    Loader2,
    Check,
    Crown,
    Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'

const AI_MODELS = [
    {
        id: 'deepseek-chat',
        name: 'DeepSeek R1',
        description: 'Fast, capable, and free for all users',
        tier: 'FREE',
        speed: 'Fast'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'OpenAI\'s most capable model',
        tier: 'PREMIUM',
        speed: 'Fast'
    },
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Anthropic\'s balanced model',
        tier: 'PREMIUM',
        speed: 'Medium'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Google\'s advanced reasoning model',
        tier: 'PREMIUM',
        speed: 'Fast'
    },
]

export default function AIPreferencesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [selectedModel, setSelectedModel] = useState('deepseek-chat')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user?.preferredModel) {
            setSelectedModel(session.user.preferredModel)
        }
    }, [session?.user?.preferredModel])

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)

        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferredModel: selectedModel })
            })

            if (response.ok) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (error) {
            console.error('Error saving preferences:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const userTier = session?.user?.subscriptionTier || 'FREE'
    const canUsePremiumModels = userTier === 'PREMIUM' || userTier === 'INSTITUTION'

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        <Sparkles className="h-8 w-8 text-purple-500" />
                        <h1 className="text-3xl font-bold">AI Preferences</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Choose your preferred AI model for conversations
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {AI_MODELS.map((model, index) => {
                        const isSelected = selectedModel === model.id
                        const isLocked = model.tier === 'PREMIUM' && !canUsePremiumModels

                        return (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all ${isSelected
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : isLocked
                                                ? 'opacity-60'
                                                : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => !isLocked && setSelectedModel(model.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.tier === 'PREMIUM'
                                                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                                                        : 'bg-primary/10'
                                                    }`}>
                                                    {model.tier === 'PREMIUM' ? (
                                                        <Crown className="h-5 w-5 text-amber-500" />
                                                    ) : (
                                                        <Zap className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{model.name}</h3>
                                                        {model.tier === 'PREMIUM' && (
                                                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full">
                                                                Premium
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{model.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Speed: {model.speed}</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                }`}>
                                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {!canUsePremiumModels && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                    >
                        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Crown className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <p className="font-medium">Upgrade to Premium</p>
                                        <p className="text-sm text-muted-foreground">
                                            Unlock access to GPT-4o, Claude, Gemini, and more
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            'Save Preferences'
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
