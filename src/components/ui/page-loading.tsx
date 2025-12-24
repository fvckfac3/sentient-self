"use client";

import { motion } from "framer-motion";
import { MainNav } from "@/components/layout/main-nav";

export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <MainNav />
      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <span className="text-white font-bold text-xl">SS</span>
          </motion.div>
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </motion.div>
      </main>
    </div>
  );
}
