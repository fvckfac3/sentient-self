"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  };
  isLast?: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div 
        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? "bg-gradient-to-br from-green-500 to-teal-500" 
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative group rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
            isUser
              ? "bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-br-md"
              : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md"
          }`}
        >
          {/* Message content */}
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>

          {/* Copy button for assistant messages */}
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="absolute -right-10 top-1 opacity-0 group-hover:opacity-100 transition-opacity min-h-[32px] min-w-[32px] hidden sm:flex"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </Button>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-[10px] sm:text-xs text-slate-400 mt-1 px-1 ${isUser ? "text-right" : "text-left"}`}>
          {format(new Date(message.createdAt), "h:mm a")}
        </p>
      </div>
    </motion.div>
  );
}
