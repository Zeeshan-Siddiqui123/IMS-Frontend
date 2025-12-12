
import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import MarkAttendance from "./MarkAttendance"
import { useAuthStore } from "@/hooks/store/authStore"
import { UserAvatar } from "./UserAvatar"
import { NotificationsDropdown } from "./NotificationsDropdown"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { usePwaInstall } from "@/hooks/usePwaInstall"

export function SiteHeader() {
  const { user } = useAuthStore()
  const { isInstallable, installPwa } = usePwaInstall()

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-1 sm:gap-2 border-b bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 sm:px-4 lg:gap-2 lg:px-6">
        {/* Hide sidebar trigger on mobile - we have bottom nav instead */}
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator
          orientation="vertical"
          className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4 hidden md:block"
        />
        <div className="ml-auto flex items-center gap-2 overflow-x-auto">
          <MarkAttendance userId={user?._id} />
          <NotificationsDropdown />

          {/* Install App Button - Mobile Only */}
          {isInstallable && (
            <Button
              variant="outline"
              size="sm"
              onClick={installPwa}
              className="md:hidden gap-1 h-8 rounded-full border-primary/20 text-primary hover:bg-primary/5"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs">Install</span>
            </Button>
          )}

          {/* Profile Link - Mobile Only */}
          <Link to="/profile" className="md:hidden">
            <UserAvatar
              src={user?.avatar}
              name={user?.name}
              className="w-8 h-8 rounded-lg border border-border"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
