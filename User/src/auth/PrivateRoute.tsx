// auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"
import Loader from "@/components/Loader"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, setUser, setLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated) {
        setIsChecking(false)
        return
      }

      try {
        const res = await userRepo.profile()
        setUser(res.user)
        setIsChecking(false)
      } catch (err) {
        console.error("Auth verification failed:", err)
        setLoading(false)
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [isAuthenticated, setUser, setLoading])

  // Show skeleton layout while checking auth (not full screen spinner)
  // Show loader while checking auth
  if (isChecking) {
    return true
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default PrivateRoute