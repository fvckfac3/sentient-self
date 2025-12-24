"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Page-level loading skeleton
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Content cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-3">
        {[...Array(lines)].map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === lines - 1 ? "w-1/2" : "w-full"}`} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-lg border-2"
        >
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-20 h-8 rounded-md" />
        </motion.div>
      ))}
    </div>
  );
}

// Stats skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-2">
          <CardContent className="pt-6 text-center space-y-2">
            <Skeleton className="w-10 h-10 rounded-full mx-auto" />
            <Skeleton className="h-6 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Chat skeleton
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          {i % 2 === 0 && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
          <div className={`space-y-2 ${i % 2 === 0 ? "items-start" : "items-end"}`}>
            <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-64" : "w-48"}`} />
            <Skeleton className="h-3 w-16" />
          </div>
          {i % 2 !== 0 && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

// Journal entry skeleton
export function JournalEntrySkeleton() {
  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card className="border-2">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(fields)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// Avatar skeleton
export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Button skeleton
export function ButtonSkeleton({ width = "w-24" }: { width?: string }) {
  return <Skeleton className={`h-11 ${width} rounded-lg`} />;
}

// Inline loading spinner
export function InlineSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} border-2 border-current border-t-transparent rounded-full`}
    />
  );
}
