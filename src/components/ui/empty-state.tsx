"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "card" | "minimal";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
}: EmptyStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-center py-8 sm:py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </motion.div>
      
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="min-h-[48px] sm:min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="min-h-[48px] sm:min-h-[44px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  if (variant === "card") {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="text-center py-6 px-4">
        <Icon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      </div>
    );
  }

  return content;
}
