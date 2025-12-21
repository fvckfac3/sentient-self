import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConversationState, ConversationWithMessages, Exercise } from '@/types'

interface ConversationStore {
  currentConversation: ConversationWithMessages | null
  state: ConversationState
  crisisMode: boolean
  suggestedExercises: Exercise[]
  isLoading: boolean

  // Actions
  setCurrentConversation: (conversation: ConversationWithMessages | null) => void
  setState: (state: ConversationState) => void
  setCrisisMode: (crisis: boolean) => void
  setSuggestedExercises: (exercises: Exercise[]) => void
  setLoading: (loading: boolean) => void
  addMessage: (content: string, role: 'USER' | 'AI') => void
  clearSuggestedExercises: () => void
  resetConversation: () => void
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      currentConversation: null,
      state: 'CONVERSATIONAL_DISCOVERY',
      crisisMode: false,
      suggestedExercises: [],
      isLoading: false,

      setCurrentConversation: (conversation) => set({
        currentConversation: conversation,
        state: conversation?.state || 'CONVERSATIONAL_DISCOVERY'
      }),

      setState: (state) => {
        set({ state })
        // Crisis mode overrides all other states
        const isCrisisMode = state === 'CRISIS_MODE'
        if (isCrisisMode) {
          set({ crisisMode: true, suggestedExercises: [] })
        } else if (get().crisisMode) {
          set({ crisisMode: false })
        }
      },

      setCrisisMode: (crisisMode) => {
        set({ crisisMode })
        if (crisisMode) {
          set({ state: 'CRISIS_MODE', suggestedExercises: [] })
        }
      },

      setSuggestedExercises: (suggestedExercises) => {
        // Only allow exercise suggestions in appropriate states
        const { state, crisisMode } = get()
        if (crisisMode || state === 'CRISIS_MODE') {
          return // No exercises in crisis mode
        }
        set({ suggestedExercises })
      },

      setLoading: (isLoading) => set({ isLoading }),

      addMessage: (content, role) => {
        const { currentConversation } = get()
        if (!currentConversation) return

        const newMessage = {
          id: crypto.randomUUID(),
          conversationId: currentConversation.id,
          role: role,
          content,
          createdAt: new Date()
        }

        set({
          currentConversation: {
            ...currentConversation,
            messages: [...currentConversation.messages, newMessage]
          }
        })
      },

      clearSuggestedExercises: () => set({ suggestedExercises: [] }),

      resetConversation: () => set({
        currentConversation: null,
        state: 'CONVERSATIONAL_DISCOVERY',
        crisisMode: false,
        suggestedExercises: [],
        isLoading: false
      })
    }),
    {
      name: 'conversation-storage',
      partialize: (state) => ({
        // Only persist certain fields, not isLoading
        currentConversation: state.currentConversation,
        state: state.state
      }),
      skipHydration: typeof window === 'undefined',
    }
  )
)