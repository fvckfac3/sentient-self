'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    MessageCircle,
    BookOpen,
    TrendingUp,
    BarChart3,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="bottom-nav md:hidden">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'bottom-nav-item',
                                isActive && 'active'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
