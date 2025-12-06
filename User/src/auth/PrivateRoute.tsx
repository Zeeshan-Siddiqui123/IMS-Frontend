// auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"
import { Skeleton } from "@/components/ui/skeleton"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, setUser, setLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("🔐 PrivateRoute: isAuthenticated =", isAuthenticated)

      if (isAuthenticated) {
        console.log("✅ Already authenticated, skipping API call")
        setIsChecking(false)
        return
      }

      console.log("⏳ Not authenticated, calling profile API...")
      try {
        const res = await userRepo.profile()
        console.log("📦 Profile API Response:", res)
        console.log("👤 User from response:", res.user)
        setUser(res.user)
        console.log("✅ User set successfully")
        setIsChecking(false)
      } catch (err) {
        console.error("❌ Auth verification failed:", err)
        setLoading(false)
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [isAuthenticated, setUser, setLoading])

  console.log("🎯 PrivateRoute render: isChecking =", isChecking, "isAuthenticated =", isAuthenticated)

  // Show skeleton layout while checking auth (not full screen spinner)
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="h-16 border-b px-4 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* Content skeleton */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute