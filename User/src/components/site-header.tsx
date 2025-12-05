
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { APPNAME } from "@/lib/constant"
import MarkAttendance from "./MarkAttendance"
import { useAuthStore } from "@/hooks/store/authStore"
export function SiteHeader() {
  const { user } = useAuthStore()


  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-1 sm:gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6">
        {/* Hide sidebar trigger on mobile - we have bottom nav instead */}
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator
          orientation="vertical"
          className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4 hidden md:block"
        />
        <div className="ml-auto flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <MarkAttendance userId={user?._id} />
        </div>
      </div>
    </header>
  )
}
