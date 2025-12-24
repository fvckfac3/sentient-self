"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  User,
  LogOut,
  Crown,
  Home,
  Trophy,
} from "lucide-react";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MainNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPremium = session?.user?.subscriptionTier === "PREMIUM" || 
                    session?.user?.subscriptionTier === "INSTITUTION";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" />
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 safe-area-top">
      <nav className="container mx-auto px-4 sm:px-6 safe-area-x">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/chat" 
            className="flex items-center gap-2 min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-sm">SS</span>
            </motion.div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 hidden sm:inline">
              Sentient Self
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`min-h-[44px] gap-2 transition-all ${
                      isActive 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Premium Badge - Desktop */}
            {isPremium && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full border border-amber-200 dark:border-amber-800"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Premium
                </span>
              </motion.div>
            )}

            <ThemeToggle />

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="min-h-[44px] gap-2 px-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="max-w-[100px] truncate text-sm hidden lg:inline">
                      {session?.user?.name || session?.user?.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings/billing" className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden min-h-[44px] min-w-[44px]"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">SS</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Sentient Self
                        </p>
                        {isPremium && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium Member
                          </p>
                        )}
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto py-4 scroll-touch">
                    <div className="px-2 space-y-1">
                      {navItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <SheetClose asChild>
                              <Link href={item.href}>
                                <Button
                                  variant={isActive ? "secondary" : "ghost"}
                                  className={`w-full justify-start min-h-[52px] gap-3 text-base px-4 ${
                                    isActive 
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" 
                                      : "text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  <item.icon className="w-5 h-5" />
                                  {item.label}
                                  {item.href === "/analytics" && !isPremium && (
                                    <Crown className="w-4 h-4 ml-auto text-amber-500" />
                                  )}
                                </Button>
                              </Link>
                            </SheetClose>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* User Section */}
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4 safe-area-bottom">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Upgrade CTA for free users */}
                    {!isPremium && (
                      <SheetClose asChild>
                        <Link href="/settings/billing">
                          <Button className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    
                    {/* Sign Out */}
                    <Button
                      variant="ghost"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full justify-start min-h-[48px] gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
