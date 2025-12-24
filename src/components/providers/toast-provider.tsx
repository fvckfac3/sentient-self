"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="top-center"
      toastOptions={{
        duration: 4000,
        className: "font-sans",
        style: {
          padding: "16px",
          borderRadius: "12px",
        },
      }}
      richColors
      closeButton
      expand={false}
      visibleToasts={3}
    />
  );
}
