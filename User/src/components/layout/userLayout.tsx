import React from 'react'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../app-sidebar'
import { SiteHeader } from '../site-header'
import { Outlet, useLocation } from 'react-router-dom'

import { BottomNav } from '../BottomNav'
import PullToRefresh from '../PullToRefresh'
import { cn } from '@/lib/utils'

const UserLayout = () => {
    const location = useLocation();
    const isDirectPage = location.pathname.startsWith('/direct');

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 16)",
                } as React.CSSProperties
            }
        >
            {/* Sidebar - hidden on mobile via CSS */}
            <AppSidebar variant="inset" className="hidden md:flex" />
            <SidebarInset className={cn(
                isDirectPage && "md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:ml-0 h-svh overflow-hidden"
            )}>
                <SiteHeader />
                {/* Add bottom padding on mobile for BottomNav */}
                <div className={cn(
                    "flex-1 flex flex-col overflow-hidden min-h-0",
                    "pb-16 md:pb-0" // Always add bottom padding on mobile for BottomNav
                )}>
                    {isDirectPage ? (
                        <Outlet />
                    ) : (
                        <PullToRefresh>
                            <Outlet />
                        </PullToRefresh>
                    )}
                </div>
            </SidebarInset>
            {/* Bottom Navigation - only visible on mobile */}
            <BottomNav />

        </SidebarProvider>
    )
}

export default UserLayout
