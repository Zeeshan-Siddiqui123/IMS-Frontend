import React from 'react'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../app-sidebar'
import { SiteHeader } from '../site-header'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import { BottomNav } from '../BottomNav'

const UserLayout = () => {
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
            <SidebarInset>
                <SiteHeader />
                {/* Add bottom padding on mobile for BottomNav */}
                <div className="pb-20 md:pb-0">
                    <Outlet />
                </div>
            </SidebarInset>
            {/* Bottom Navigation - only visible on mobile */}
            <BottomNav />
            <Toaster />
        </SidebarProvider>
    )
}

export default UserLayout
