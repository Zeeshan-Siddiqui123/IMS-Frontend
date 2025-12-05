"use client"

import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, CalendarCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { buttonVariants } from "@/components/ui/button"

interface DockItem {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
}

const navItems: DockItem[] = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Posts', url: '/posts', icon: FileText },
    { title: 'Attendance', url: '/attendance', icon: CalendarCheck },
    { title: 'Profile', url: '/profile', icon: User },
]

export function BottomNav() {
    const location = useLocation()

    return (
        <TooltipProvider delayDuration={0}>
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden safe-area-bottom">
                <div className="flex items-center gap-1 rounded-2xl border bg-background/80 backdrop-blur-lg p-2 shadow-lg">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.url
                        const Icon = item.icon

                        return (
                            <Tooltip key={item.url}>
                                <TooltipTrigger asChild>
                                    <Link
                                        to={item.url}
                                        aria-label={item.title}
                                        className={cn(
                                            buttonVariants({ variant: "ghost", size: "icon" }),
                                            "size-12 rounded-xl transition-all duration-200",
                                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                    <p>{item.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </nav>
        </TooltipProvider>
    )
}
