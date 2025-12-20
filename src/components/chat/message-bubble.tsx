'use client'

import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
  content: string
  isUser: boolean
  timestamp?: Date
  isTyping?: boolean
}

export function MessageBubble({ content, isUser, timestamp, isTyping }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex gap-3 max-w-3xl message-enter",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary" : "bg-muted"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "rounded-lg px-4 py-3 max-w-md",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}>
        {isTyping ? (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {content}
          </div>
        )}
      </div>

      {/* Timestamp */}
      {timestamp && !isTyping && (
        <div className="flex-shrink-0 text-xs text-muted-foreground self-end mb-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}