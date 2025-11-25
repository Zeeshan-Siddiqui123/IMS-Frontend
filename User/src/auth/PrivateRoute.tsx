// auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, setUser, isLoading, setLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated) {
        setIsChecking(false)
        return
      }

      try {
        const res = await userRepo.profile()
        setUser(res.data)
        setIsChecking(false)
      } catch (err) {
        console.error("Auth verification failed:", err)
        setLoading(false)
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [isAuthenticated, setUser, setLoading])

  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute