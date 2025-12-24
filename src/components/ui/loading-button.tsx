"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading = false,
      isSuccess = false,
      loadingText,
      successText,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={isLoading || disabled}
        className={`relative ${className}`}
        {...props}
      >
        <motion.span
          initial={false}
          animate={{
            opacity: isLoading || isSuccess ? 0 : 1,
            y: isLoading || isSuccess ? 10 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          {children}
        </motion.span>

        {/* Loading state */}
        <motion.span
          initial={false}
          animate={{
            opacity: isLoading ? 1 : 0,
            y: isLoading ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </motion.span>

        {/* Success state */}
        <motion.span
          initial={false}
          animate={{
            opacity: isSuccess ? 1 : 0,
            scale: isSuccess ? 1 : 0.5,
          }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center gap-2 text-green-500"
        >
          <Check className="w-4 h-4" />
          {successText && <span>{successText}</span>}
        </motion.span>
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
