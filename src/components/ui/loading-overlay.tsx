"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Loading...",
  fullScreen = false 
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            ${fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 z-10"} 
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm 
            flex items-center justify-center
          `}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-2 border-slate-200 dark:border-slate-700"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
