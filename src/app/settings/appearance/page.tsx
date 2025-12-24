"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MainNav } from "@/components/layout/main-nav";
import { AnimatedBackground } from "@/components/chat/animated-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Palette, Sun, Moon, Monitor, Check } from "lucide-react";

export default function AppearanceSettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  if (!mounted || status === "loading") {
    return null;
  }

  const themes = [
    {
      id: "light",
      name: "Light",
      description: "Clean and bright appearance",
      icon: Sun,
      preview: "bg-white border-slate-200",
    },
    {
      id: "dark",
      name: "Dark",
      description: "Easy on the eyes, perfect for night",
      icon: Moon,
      preview: "bg-slate-900 border-slate-700",
    },
    {
      id: "system",
      name: "System",
      description: "Follows your device settings",
      icon: Monitor,
      preview: "bg-gradient-to-r from-white to-slate-900 border-slate-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AnimatedBackground />
      <MainNav />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Back Button */}
          <Link href="/settings">
            <Button variant="ghost" className="gap-2 -ml-2 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Button>
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Appearance
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Customize how Sentient Self looks
            </p>
          </div>

          {/* Theme Selection */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme
              </CardTitle>
              <CardDescription>
                Select your preferred color theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {themes.map((t, index) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleThemeChange(t.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Theme Preview */}
                        <div className={`w-12 h-12 rounded-lg border-2 ${t.preview} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${t.id === 'dark' ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        
                        {/* Theme Info */}
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {t.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t.description}
                          </p>
                        </div>
                        
                        {/* Selected Indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how components look with your current theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This is how text appears in muted containers.
                </p>
              </div>
              
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500" />
                <div className="w-8 h-8 rounded-full bg-purple-500" />
                <div className="w-8 h-8 rounded-full bg-green-500" />
                <div className="w-8 h-8 rounded-full bg-amber-500" />
                <div className="w-8 h-8 rounded-full bg-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
