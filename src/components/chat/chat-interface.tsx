'use client'

import { useState, useRef, useEffect } from 'react'
import { useConversationStore } from '@/store/conversation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './message-bubble'
import { ExerciseSuggestions } from '../exercises/exercise-suggestions'
import { Send, Loader2 } from 'lucide-react'
import { ConversationWithMessages } from '@/types'

export function ChatInterface() {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    currentConversation,
    isLoading,
    suggestedExercises,
    state,
    addMessage,
    setCurrentConversation,
    setState,
    setSuggestedExercises,
    setLoading
  } = useConversationStore()

  const { user } = useAuthStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setIsTyping(true)
    setLoading(true)

    // Add user message to UI immediately
    addMessage(userMessage, 'USER')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversation?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresOnboarding) {
          window.location.href = '/onboarding'
          return
        }
        throw new Error(data.error || 'Failed to send message')
      }

      // Update conversation if new
      if (!currentConversation && data.conversationId) {
        const newConversation: ConversationWithMessages = {
          id: data.conversationId,
          userId: user!.id,
          state: data.state,
          createdAt: new Date(),
          messages: []
        }
        setCurrentConversation(newConversation)
      }

      // Add AI response to UI
      addMessage(data.response, 'AI')
      
      // Update state
      setState(data.state)
      
      // Handle suggested exercises
      if (data.suggestedExercises?.length > 0) {
        setSuggestedExercises(data.suggestedExercises)
      }

      // Handle crisis detection
      if (data.crisisDetected) {
        // Crisis mode will be handled by the state update
        console.log('Crisis detected, switching to crisis mode')
      }

    } catch (error) {
      console.error('Error sending message:', error)
      addMessage('Sorry, I encountered an error. Please try again.', 'AI')
    } finally {
      setIsTyping(false)
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleExerciseResponse = (response: 'accept' | 'decline' | 'custom', exerciseId?: string) => {
    // Handle exercise selection
    const responseMessage = response === 'accept' 
      ? `I'd like to try the suggested exercise.`
      : response === 'decline'
      ? `Thanks for the suggestions, but I'd prefer to keep talking.`
      : `I'd like to try a custom exercise.`
    
    setMessage(responseMessage)
    setSuggestedExercises([])
    
    // Send the response
    setTimeout(() => sendMessage(), 100)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">Sentient Self Guide</h1>
            <p className="text-sm text-muted-foreground">
              {state === 'CRISIS_MODE' ? 'Crisis Support Mode' : 
               state === 'EXERCISE_FACILITATION' ? 'Exercise in Progress' :
               'Therapeutic Conversation'}
            </p>
          </div>
          {state !== 'CONVERSATIONAL_DISCOVERY' && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              {state.replace('_', ' ').toLowerCase()}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentConversation?.messages?.length && (
          <div className="text-center text-muted-foreground py-8">
            <h2 className="text-lg font-medium mb-2">Welcome to Sentient Self</h2>
            <p className="mb-4">I'm here to listen and support you. What would you like to talk about today?</p>
          </div>
        )}

        {currentConversation?.messages?.map((msg, index) => (
          <MessageBubble
            key={msg.id || index}
            content={msg.content}
            isUser={msg.role === 'USER'}
            timestamp={msg.createdAt}
          />
        ))}

        {/* Exercise suggestions */}
        {suggestedExercises.length > 0 && (
          <ExerciseSuggestions
            exercises={suggestedExercises}
            onResponse={handleExerciseResponse}
          />
        )}

        {isTyping && (
          <MessageBubble
            content="..."
            isUser={false}
            isTyping={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!message.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}