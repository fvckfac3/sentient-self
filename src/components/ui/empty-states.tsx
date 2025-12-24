"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "./empty-state";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Trophy,
  Dumbbell,
  Search,
  AlertCircle,
  Wifi,
  Plus,
} from "lucide-react";

// No conversations yet
export function EmptyConversations() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No conversations yet"
      description="Start a conversation with your AI companion to begin your journey."
      action={{
        label: "Start Chatting",
        onClick: () => {},
        icon: Plus,
      }}
      variant="card"
    />
  );
}

// No journal entries
export function EmptyJournal({ onCreateEntry }: { onCreateEntry: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Your journal is empty"
      description="Start journaling to track your thoughts, mood, and energy over time."
      action={{
        label: "Create First Entry",
        onClick: onCreateEntry,
        icon: Plus,
      }}
      variant="card"
    />
  );
}

// No analytics data
export function EmptyAnalytics() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={BarChart3}
      title="Not enough data yet"
      description="Use the app for a few days to see your progress analytics."
      action={{
        label: "Start Chatting",
        onClick: () => router.push("/chat"),
      }}
      secondaryAction={{
        label: "Write in Journal",
        onClick: () => router.push("/journal"),
      }}
      variant="card"
    />
  );
}

// No achievements
export function EmptyAchievements() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={Trophy}
      title="No achievements yet"
      description="Complete exercises and maintain streaks to earn achievements."
      action={{
        label: "Start Your Journey",
        onClick: () => router.push("/chat"),
      }}
      variant="card"
    />
  );
}

// No exercises completed
export function EmptyExercises() {
  return (
    <EmptyState
      icon={Dumbbell}
      title="No exercises completed"
      description="Your AI companion will suggest exercises during conversations when appropriate."
      variant="card"
    />
  );
}

// No search results
export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      variant="minimal"
    />
  );
}

// Error state
export function ErrorState({ 
  message = "Something went wrong",
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Oops!"
      description={message}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
      } : undefined}
      variant="card"
    />
  );
}

// Offline state
export function OfflineState() {
  return (
    <EmptyState
      icon={Wifi}
      title="You're offline"
      description="Check your internet connection and try again."
      action={{
        label: "Retry",
        onClick: () => window.location.reload(),
      }}
      variant="card"
    />
  );
}
