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
import { Check, LogOut, User } from "lucide-react"
import Logout from "@/auth/Logout"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"


const data = {
  navMain: [
    { title: "Dashboard", url: "/", icon: IconDashboard },
    { title: "Post", url: "/posts", icon: IconChartBar },
    { title: "Attendance", url: "/attendance", icon: Check },
  ],
}

export function AppSidebar(props) {

  const { user, setUser, isLoading, setLoading } = useAuthStore()

  const triggerLogout = () => {
    document.getElementById("logoutBtn")?.click()
  }

  // Fetch User Profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await userRepo.profile()
        setUser(res.user)
      } catch (err) {
        console.log("Profile error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [setUser, setLoading])


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

      <SidebarContent className="flex flex-col">

        <NavMain items={data.navMain} />

        {/* ⭐ USER PROFILE SECTION — FIXED BOTTOM */}
        <div className="mt-auto border-t px-3 py-4">

          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
              alt="User"
              className="w-10 h-10 rounded-full border"
            />

            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {isLoading ? "Loading..." : user?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : user?.email}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <Link to="/profile" className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </Link>

            <button
              onClick={triggerLogout}
              className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent text-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        <Logout />

      </SidebarContent>

    </Sidebar>
  )
}
