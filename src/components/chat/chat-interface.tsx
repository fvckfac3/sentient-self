'use client'

import { useState, useRef, useEffect } from 'react'
import { useConversationStore } from '@/store/conversation'
import { useAuthStore } from '@/store/auth'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatHeader } from './chat-header'
import { TypingIndicator } from './typing-indicator'
import { ExerciseCardAnimated } from './exercise-card-animated'
import { ModelSelector } from './model-selector'
import { ExerciseProgress } from './exercise-progress'
import { CrisisBanner } from './crisis-banner'
import { ConversationWithMessages } from '@/types'
import { type ModelId } from '@/lib/models'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatInterface() {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [exerciseData, setExerciseData] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState<ModelId>('deepseek-chat')
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
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
          conversationId: currentConversation?.id,
          exerciseId: activeExerciseId,
          modelId: selectedModel
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
          messages: [],
          // Gate validation fields (defaults)
          gateCondition1_challengeArticulated: false,
          gateCondition2_aiReflectedAccurately: false,
          gateCondition3_userEmotionallyRegulated: true,
          gateCondition4_structureExplained: false,
          gateCondition5_noRecentDecline: true,
          lastDeclinedAt: null,
          // Exercise facilitation fields (defaults)
          activeExerciseId: null,
          activeFrameworkId: null,
          currentPhaseIndex: 0,
          exerciseStartedAt: null,
          exerciseCompletedAt: null,
          exerciseReflection: null,
          exercisesCompleted: 0
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
        console.log('🚨 Crisis detected, showing crisis banner')
        setShowCrisisBanner(true)
        setState('CRISIS_MODE')
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

  const handleExerciseResponse = async (response: 'accept' | 'decline' | 'custom', exerciseId?: string) => {
    if (response === 'accept' && exerciseId) {
      // Load exercise and framework data
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`)
        const data = await res.json()
        
        if (res.ok) {
          setActiveExerciseId(exerciseId)
          setExerciseData(data)
          setState('EXERCISE_FACILITATION')
        }
      } catch (error) {
        console.error('Error loading exercise:', error)
      }
    }
    
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

  const handleStartExercise = async (exerciseId: string) => {
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`)
      const data = await res.json()
      
      if (res.ok) {
        setActiveExerciseId(exerciseId)
        setExerciseData(data)
        setState('EXERCISE_FACILITATION')
        setSuggestedExercises([])
        
        // Send acceptance message to start exercise
        setMessage("Yes, I'd like to try this exercise.")
        setTimeout(() => sendMessage(), 100)
      }
    } catch (error) {
      console.error('Error loading exercise:', error)
    }
  }

  const handleCancelExercise = async () => {
    if (!currentConversation?.id) return
    
    try {
      await fetch(`/api/exercises/active?conversationId=${currentConversation.id}`, {
        method: 'DELETE'
      })
      
      setActiveExerciseId(null)
      setExerciseData(null)
      setState('CONVERSATIONAL_DISCOVERY')
    } catch (error) {
      console.error('Error canceling exercise:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Crisis Banner - Shows at top when crisis detected */}
      <CrisisBanner 
        isVisible={showCrisisBanner || state === 'CRISIS_MODE'} 
        onDismiss={() => setShowCrisisBanner(false)}
      />

      {/* Header */}
      <ChatHeader
        modelName={selectedModel === 'claude-3-5-sonnet' ? 'Claude 3.5 Sonnet' : 
                   selectedModel === 'gpt-4o' ? 'GPT-4o' : 
                   'DeepSeek Chat'}
        userName={user?.email?.split('@')[0]}
        state={state}
        onSettingsClick={() => {
          // TODO: Open settings modal
          console.log('Settings clicked')
        }}
      />

      {/* Exercise Progress Header */}
      <AnimatePresence>
        {exerciseData && activeExerciseId && state === 'EXERCISE_FACILITATION' && (
          <ExerciseProgress
            exerciseTitle={exerciseData.exercise.title}
            frameworkName={exerciseData.framework.name}
            currentPhase={currentConversation?.currentPhaseIndex || 0}
            totalPhases={exerciseData.framework.phases?.length || 1}
            phaseName={exerciseData.framework.phases?.[currentConversation?.currentPhaseIndex || 0]?.phase_name || 'Processing'}
            onCancel={handleCancelExercise}
          />
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-1">
          {!currentConversation?.messages?.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-muted-foreground py-8"
            >
              <h2 className="text-lg font-medium mb-2">Welcome to Sentient Self</h2>
              <p className="mb-4">I'm here to listen and support you. What would you like to talk about today?</p>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {currentConversation?.messages?.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                message={{
                  id: msg.id,
                  role: msg.role === 'USER' ? 'user' : 'assistant',
                  content: msg.content,
                  createdAt: msg.createdAt.toISOString(),
                }}
                isLast={index === currentConversation.messages.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Exercise Cards */}
          {suggestedExercises.length > 0 && (
            <div className="space-y-3 ml-11">
              <AnimatePresence>
                {suggestedExercises.map((exercise) => (
                  <ExerciseCardAnimated
                    key={exercise.id}
                    id={exercise.id}
                    title={exercise.title}
                    framework={exercise.framework || 'Therapeutic Exercise'}
                    description={exercise.aspect || 'A guided exercise to help with your current situation.'}
                    onStart={handleStartExercise}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={() => sendMessage()}
        disabled={isLoading}
        placeholder="Share what's on your mind..."
      />
    </div>
  )
}