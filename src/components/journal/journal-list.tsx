'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface JournalEntry {
  id: string
  date: string
  mood: number | null
  energy: number | null
  content: string
  gratitude: string | null
  goals: string | null
  createdAt: string
  updatedAt: string
}

interface JournalListProps {
  refreshTrigger?: number
}

// Mood emoji mapping
const moodEmojis: { [key: number]: string } = {
  1: '😢', 2: '😞', 3: '😕', 4: '🙁', 5: '😐',
  6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩'
}

// Energy color coding
const getEnergyColor = (energy: number | null): string => {
  if (!energy) return 'bg-gray-100 text-gray-800'
  if (energy <= 3) return 'bg-red-100 text-red-800'
  if (energy <= 7) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getEnergyLabel = (energy: number | null): string => {
  if (!energy) return 'Unknown'
  if (energy <= 3) return 'Low'
  if (energy <= 7) return 'Medium'
  return 'High'
}

export function JournalList({ refreshTrigger }: JournalListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchEntries = async () => {
    try {
      setLoading(true)
      let url = '/api/journal?limit=50'
      
      if (dateRange.startDate) {
        url += `&startDate=${dateRange.startDate}`
      }
      if (dateRange.endDate) {
        url += `&endDate=${dateRange.endDate}`
      }

      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [refreshTrigger, dateRange])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Normalize to midnight for comparison
    const normalizeDate = (d: Date) => {
      const normalized = new Date(d)
      normalized.setHours(0, 0, 0, 0)
      return normalized
    }
    
    const normalizedDate = normalizeDate(date)
    const normalizedToday = normalizeDate(today)
    const normalizedYesterday = normalizeDate(yesterday)
    
    if (normalizedDate.getTime() === normalizedToday.getTime()) return '📅 Today'
    if (normalizedDate.getTime() === normalizedYesterday.getTime()) return '📅 Yesterday'
    
    return '📅 ' + date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getContentPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const getTextPreview = (text: string | null, maxLength: number = 80) => {
    if (!text) return null
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading journal entries...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setDateRange({ startDate: '', endDate: '' })}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Journal History</h2>
        {entries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12">
              <div className="text-center space-y-3">
                <div className="text-6xl">📔</div>
                <p className="text-lg font-semibold text-foreground">
                  No journal entries yet
                </p>
                <p className="text-muted-foreground">
                  Start writing to track your journey and build a habit!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const isExpanded = expandedId === entry.id
              return (
                <Card
                  key={entry.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => toggleExpand(entry.id)}
                >
                  <CardContent className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-4xl flex-shrink-0">
                          {entry.mood ? moodEmojis[entry.mood] : '😐'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-foreground text-lg">
                              {formatDate(entry.date)}
                            </p>
                            <button 
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(entry.id)
                              }}
                            >
                              {isExpanded ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {entry.mood && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                Mood: {entry.mood}/10
                              </span>
                            )}
                            {entry.energy && (
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEnergyColor(entry.energy)}`}>
                                ⚡ Energy: {getEnergyLabel(entry.energy)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview/Full */}
                    <div className="text-muted-foreground pl-14">
                      {isExpanded ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="p-4 bg-accent/30 rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <span>📝</span> Journal Entry:
                            </p>
                            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                              {entry.content}
                            </p>
                          </div>
                          
                          {entry.gratitude && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <span>💚</span> Gratitude:
                              </p>
                              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                {entry.gratitude}
                              </p>
                            </div>
                          )}
                          
                          {entry.goals && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <span>🎯</span> Goals:
                              </p>
                              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                {entry.goals}
                              </p>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground pt-2 border-t">
                            Last updated: {new Date(entry.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-foreground leading-relaxed">
                            {getContentPreview(entry.content)}
                          </p>
                          
                          {/* Preview badges */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {entry.gratitude && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                💚 {getTextPreview(entry.gratitude)}
                              </span>
                            )}
                            {entry.goals && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                🎯 {getTextPreview(entry.goals)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
