'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Shield,
    Download,
    Trash2,
    AlertTriangle,
    ArrowLeft,
    FileJson,
    FileSpreadsheet,
    Loader2,
    Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedBackground } from '@/components/chat/animated-background'
import { Nav } from '@/components/layout/nav'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PrivacySettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isExporting, setIsExporting] = useState(false)
    const [exportSuccess, setExportSuccess] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [deleteError, setDeleteError] = useState<string | null>(null)

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!session) {
        router.push('/auth/signin')
        return null
    }

    const handleExport = async (format: 'json' | 'csv') => {
        setIsExporting(true)
        setExportSuccess(null)

        try {
            const response = await fetch(`/api/export?format=${format}`)

            if (!response.ok) {
                throw new Error('Export failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sentient-self-export-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setExportSuccess(format.toUpperCase())
        } catch (error) {
            console.error('Export error:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setDeleteError('Please type DELETE to confirm')
            return
        }

        setIsDeleting(true)
        setDeleteError(null)

        try {
            const response = await fetch('/api/account', {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Deletion failed')
            }

            // Sign out and redirect to home
            await signOut({ callbackUrl: '/' })
        } catch (error) {
            console.error('Delete error:', error)
            setDeleteError(error instanceof Error ? error.message : 'Failed to delete account')
            setIsDeleting(false)
        }
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
                        <Shield className="h-8 w-8 text-red-500" />
                        <h1 className="text-3xl font-bold">Privacy & Safety</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage your data, privacy settings, and account
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Data Export Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="h-5 w-5 text-blue-500" />
                                    Export Your Data
                                </CardTitle>
                                <CardDescription>
                                    Download a copy of all your data including profile, journal entries, and exercise history.
                                    Raw AI conversation messages are excluded for privacy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleExport('json')}
                                        disabled={isExporting}
                                        className="flex items-center gap-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : exportSuccess === 'JSON' ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <FileJson className="h-4 w-4" />
                                        )}
                                        Export as JSON
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleExport('csv')}
                                        disabled={isExporting}
                                        className="flex items-center gap-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : exportSuccess === 'CSV' ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <FileSpreadsheet className="h-4 w-4" />
                                        )}
                                        Export as CSV
                                    </Button>
                                </div>
                                {exportSuccess && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ✓ {exportSuccess} export downloaded successfully
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Crisis Settings Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    Crisis Detection
                                </CardTitle>
                                <CardDescription>
                                    Our AI monitors for signs of crisis and will provide immediate access to support resources.
                                    This feature cannot be disabled for your safety.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                    <p className="font-medium mb-2">Crisis Resources (Available 24/7):</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>📞 <strong>988</strong> - Suicide & Crisis Lifeline</li>
                                        <li>💬 Text <strong>HOME</strong> to <strong>741741</strong> - Crisis Text Line</li>
                                        <li>🚨 <strong>911</strong> - Emergency Services</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Delete Account Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                    Delete Account
                                </CardTitle>
                                <CardDescription>
                                    Permanently delete your account and all associated data.
                                    This action is immediate and cannot be undone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="flex items-center gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Delete My Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                                <AlertTriangle className="h-5 w-5" />
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="space-y-4">
                                                <p>
                                                    This action <strong>cannot be undone</strong>. This will permanently delete:
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    <li>Your account and profile</li>
                                                    <li>All conversations with the AI</li>
                                                    <li>All journal entries</li>
                                                    <li>All exercise completions and progress</li>
                                                    <li>Your baseline profile and preferences</li>
                                                </ul>
                                                <div className="pt-2">
                                                    <p className="text-sm font-medium mb-2">
                                                        Type <strong>DELETE</strong> to confirm:
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmation}
                                                        onChange={(e) => {
                                                            setDeleteConfirmation(e.target.value)
                                                            setDeleteError(null)
                                                        }}
                                                        placeholder="DELETE"
                                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                                    />
                                                    {deleteError && (
                                                        <p className="text-sm text-destructive mt-1">{deleteError}</p>
                                                    )}
                                                </div>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => {
                                                setDeleteConfirmation('')
                                                setDeleteError(null)
                                            }}>
                                                Cancel
                                            </AlertDialogCancel>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteAccount}
                                                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete Account Forever'
                                                )}
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
