import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserWithProfile, SubscriptionTier } from '@/types'

interface AuthState {
  user: UserWithProfile | null
  isLoading: boolean
  subscriptionTier: SubscriptionTier
  setUser: (user: UserWithProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hasOnboardingCompleted: () => boolean
  getSubscriptionLimits: () => {
    exercisesPerMonth: number
    aiModels: string[]
    hasJournalAnalysis: boolean
    hasAnalyticsDashboard: boolean
    hasGamification: boolean
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      subscriptionTier: 'FREE',
      
      setUser: (user) => {
        set({ 
          user, 
          subscriptionTier: user?.subscriptionTier || 'FREE',
          isLoading: false 
        })
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        subscriptionTier: 'FREE',
        isLoading: false 
      }),
      
      hasOnboardingCompleted: () => {
        const { user } = get()
        return user?.onboardingDone || false
      },
      
      getSubscriptionLimits: () => {
        const { subscriptionTier } = get()
        
        switch (subscriptionTier) {
          case 'FREE':
            return {
              exercisesPerMonth: 5,
              aiModels: ['deepseek-r1'],
              hasJournalAnalysis: false,
              hasAnalyticsDashboard: true,
              hasGamification: false
            }
          case 'PREMIUM':
          case 'INSTITUTION':
            return {
              exercisesPerMonth: -1, // unlimited
              aiModels: ['deepseek-r1', 'gpt-5.2', 'claude-4.5-opus', 'gemini-3-pro', 'grok-4.1'],
              hasJournalAnalysis: true,
              hasAnalyticsDashboard: true,
              hasGamification: true
            }
          default:
            return {
              exercisesPerMonth: 5,
              aiModels: ['deepseek-r1'],
              hasJournalAnalysis: false,
              hasAnalyticsDashboard: false,
              hasGamification: false
            }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        subscriptionTier: state.subscriptionTier 
      }),
      skipHydration: typeof window === 'undefined',
    }
  )
)