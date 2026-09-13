'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface JournalEditorProps {
  onSave?: () => void
}

// Mood emoji mapping
const moodEmojis: { [key: number]: string } = {
  1: '😢', 2: '😞', 3: '😕', 4: '🙁', 5: '😐',
  6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩'
}

// Energy color coding
const getEnergyColor = (energy: number) => {
  if (energy <= 3) return 'text-red-500'
  if (energy <= 7) return 'text-yellow-500'
  return 'text-green-500'
}

const getEnergyLabel = (energy: number) => {
  if (energy <= 3) return 'Low'
  if (energy <= 7) return 'Medium'
  return 'High'
}

export function JournalEditor({ onSave }: JournalEditorProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [autoGenerateInsights, setAutoGenerateInsights] = useState(false)
  
  const [formData, setFormData] = useState({
    content: '',
    mood: 5,
    energy: 5,
    gratitude: '',
    goals: ''
  })

  const MAX_CONTENT_LENGTH = 5000
  const MAX_GRATITUDE_LENGTH = 1000
  const MAX_GOALS_LENGTH = 1000

  const subscriptionTier = session?.user?.subscriptionTier || 'FREE'
  const isPremium = subscriptionTier === 'PREMIUM' || subscriptionTier === 'INSTITUTION'

  // Fetch today's entry on mount (if exists)
  useEffect(() => {
    const fetchTodayEntry = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = today.toISOString()
        const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()

        const response = await fetch(
          `/api/journal?startDate=${startDate}&endDate=${endDate}&limit=1`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.entries && data.entries.length > 0) {
            const entry = data.entries[0]
            setExistingEntryId(entry.id)
            setFormData({
              content: entry.content || '',
              mood: entry.mood || 5,
              energy: entry.energy || 5,
              gratitude: entry.gratitude || '',
              goals: entry.goals || ''
            })
          }
        }
      } catch (error) {
        console.error('Error fetching today\'s entry:', error)
      }
    }

    if (session) {
      fetchTodayEntry()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (response.ok) {
        const savedEntryId = data.entry.id
        setExistingEntryId(savedEntryId)
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 2000)
        
        // Auto-generate insights if enabled and user is premium
        if (autoGenerateInsights && isPremium) {
          try {
            const insightsResponse = await fetch(`/api/journal/${savedEntryId}/insights`, {
              method: 'POST',
            })
            if (insightsResponse.ok) {
              toast({
                title: existingEntryId ? '✓ Entry updated!' : '✓ Entry saved!',
                description: 'Your journal entry has been saved and AI insights generated.',
              })
            } else {
              toast({
                title: existingEntryId ? '✓ Entry updated!' : '✓ Entry saved!',
                description: 'Entry saved, but insights generation failed.',
              })
            }
          } catch (error) {
            toast({
              title: existingEntryId ? '✓ Entry updated!' : '✓ Entry saved!',
              description: 'Entry saved successfully.',
            })
          }
        } else {
          toast({
            title: existingEntryId ? '✓ Entry updated!' : '✓ Entry saved!',
            description: 'Your journal entry has been saved successfully.',
          })
        }
        
        onSave?.()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save entry',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none z-10" />
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Today&apos;s Journal Entry
              {existingEntryId && (
                <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Editing
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {showSuccessAnimation && (
            <div className="text-green-500 text-3xl animate-bounce">
              ✓
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                What&apos;s on your mind? <span className="text-destructive">*</span>
              </label>
              <span className={`text-xs ${formData.content.length > MAX_CONTENT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formData.content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, MAX_CONTENT_LENGTH) })}
              className="w-full min-h-[150px] px-3 py-2 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              placeholder="Write about your day, thoughts, feelings..."
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Express yourself freely - this is your private space
            </p>
          </div>

          {/* Mood Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                How are you feeling?
              </label>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{moodEmojis[formData.mood]}</span>
                <span className="text-sm font-semibold">{formData.mood}/10</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-2xl">😢</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-primary/20 accent-primary"
              />
              <span className="text-2xl">🤩</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rate your overall mood today (1 = worst, 10 = best)
            </p>
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Energy level
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getEnergyColor(formData.energy)}`}>
                  {getEnergyLabel(formData.energy)} - {formData.energy}/10
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🔋</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy}
                onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-primary/20 accent-primary"
              />
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              How energized do you feel? (1 = exhausted, 10 = fully energized)
            </p>
          </div>

          {/* Gratitude */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                💚 What are you grateful for? (Optional)
              </label>
              <span className="text-xs text-muted-foreground">
                {formData.gratitude.length}/{MAX_GRATITUDE_LENGTH}
              </span>
            </div>
            <textarea
              value={formData.gratitude}
              onChange={(e) => setFormData({ ...formData, gratitude: e.target.value.slice(0, MAX_GRATITUDE_LENGTH) })}
              className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Three things you're grateful for today..."
            />
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                🎯 Tomorrow&apos;s goals (Optional)
              </label>
              <span className="text-xs text-muted-foreground">
                {formData.goals.length}/{MAX_GOALS_LENGTH}
              </span>
            </div>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value.slice(0, MAX_GOALS_LENGTH) })}
              className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What do you want to accomplish tomorrow?"
            />
          </div>

          {/* Auto-generate Insights Checkbox (Premium only) */}
          {isPremium && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <input
                type="checkbox"
                id="autoInsights"
                checked={autoGenerateInsights}
                onChange={(e) => setAutoGenerateInsights(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="autoInsights" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <span>🤖</span>
                <span>Generate AI insights automatically</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !formData.content.trim()}
            className="w-full transition-all hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                {autoGenerateInsights && isPremium ? 'Saving & generating insights...' : 'Saving...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {existingEntryId ? '✏️ Update Entry' : '💾 Save Entry'}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
