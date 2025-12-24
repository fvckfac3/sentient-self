"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      // Re-focus textarea after sending on desktop
      if (window.innerWidth >= 640) {
        textareaRef.current?.focus();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 sm:gap-3 p-1 rounded-xl transition-all ${
        isFocused 
          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" 
          : ""
      }`}
    >
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[48px] max-h-[150px] py-3 px-4 text-base resize-none border-2 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-colors"
          style={{ fontSize: "16px" }} // Prevents iOS zoom
        />
      </div>
      
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className={`min-h-[48px] min-w-[48px] rounded-xl transition-all ${
            value.trim() && !disabled
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
              : "bg-slate-200 dark:bg-slate-700"
          }`}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
