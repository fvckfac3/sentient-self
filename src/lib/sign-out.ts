'use client'

import { signOut } from 'next-auth/react'
import { useConversationStore } from '@/store/conversation'
import { useAuthStore } from '@/store/auth'

/**
 * Sign out and clear everything the app keeps in the browser, so the next
 * person on a shared device can't see the previous user's conversation.
 */
export async function signOutAndClear(callbackUrl = '/') {
  useConversationStore.getState().resetConversation()
  useAuthStore.getState().logout()
  try {
    localStorage.removeItem('conversation-storage')
    localStorage.removeItem('auth-storage')
  } catch {
    // Storage can be unavailable (private mode, blocked site data)
  }
  await signOut({ callbackUrl })
}
