import * as React from "react"
import { Link, useLocation } from 'react-router-dom'
import { IconDashboard, IconChartBar, IconInnerShadowTop } from "@tabler/icons-react"
import { APPNAME } from "@/lib/constant"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, LogOut, User, ChevronsUpDown } from "lucide-react"
import Logout from "@/auth/Logout"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"

const navItems = [
  { title: "Dashboard", url: "/", icon: IconDashboard },
  { title: "Post", url: "/posts", icon: IconChartBar },
  { title: "Attendance", url: "/attendance", icon: Check },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
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

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconInnerShadowTop className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{APPNAME}</span>
                  <span className="truncate text-xs text-muted-foreground">Student Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {isLoading ? "Loading..." : user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {isLoading ? "Loading..." : user?.email || ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={triggerLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <Logout />
      </SidebarFooter>
    </Sidebar>
  )
}