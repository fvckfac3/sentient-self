"use client";

import React, { ReactNode } from "react";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  Loader2,
  Trophy,
  Sparkles 
} from "lucide-react";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToastActions() {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration,
    });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId);
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  };

  // Custom achievement toast
  const achievement = (title: string, description?: string) => {
    toast.custom((t) => (
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl shadow-lg">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          {description && (
            <p className="text-sm text-white/80">{description}</p>
          )}
        </div>
      </div>
    ), { duration: 5000 });
  };

  // Custom premium feature toast
  const premiumFeature = (feature: string) => {
    toast.custom((t) => (
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-xl shadow-lg">
        <Sparkles className="w-5 h-5" />
        <div>
          <p className="font-semibold">Premium Feature</p>
          <p className="text-sm text-white/80">{feature} requires Premium</p>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
    achievement,
    premiumFeature,
  };
}
