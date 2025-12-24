"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SuccessAnimation({ size = "md", className = "" }: SuccessAnimationProps) {
  const sizes = {
    sm: { container: "w-12 h-12", icon: "w-5 h-5" },
    md: { container: "w-16 h-16", icon: "w-7 h-7" },
    lg: { container: "w-24 h-24", icon: "w-10 h-10" },
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className={`${sizes[size].container} rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30`}
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        >
          <Check className={`${sizes[size].icon} text-white stroke-[3]`} />
        </motion.div>
      </motion.div>
      
      {/* Ripple effect */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`absolute ${sizes[size].container} rounded-full bg-green-400`}
      />
    </div>
  );
}
