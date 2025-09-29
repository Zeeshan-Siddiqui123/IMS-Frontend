import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuth = localStorage.getItem("auth") === "true"
  return isAuth ? children : <Navigate to="/login" />
}

export default PrivateRoute
