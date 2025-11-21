import * as React from "react"
import { Link } from 'react-router-dom'
import { IconDashboard, IconChartBar, IconInnerShadowTop } from "@tabler/icons-react"
import { APPNAME } from "@/lib/constant"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Check, LogOut } from "lucide-react"
import Logout from "@/auth/Logout"

const data = {
  navMain: [
    { title: "Dashboard", url: "/", icon: IconDashboard },
    { title: "Post", url: "/posts", icon: IconChartBar },
    { title: "Attendance", url: "/attendance", icon: Check },
  ],
}

export function AppSidebar(props) {

  const triggerLogout = () => {
    document.getElementById("logoutBtn")?.click()
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{APPNAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Custom Logout Button */}
        <SidebarMenu className="mt-auto">
          <SidebarMenuItem>
            <SidebarMenuButton onClick={triggerLogout}>
              <LogOut className="!size-5" />
              <span className="text-base font-semibold">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Hidden Logout Component */}
        <Logout />

      </SidebarContent>

    </Sidebar>
  )
}
