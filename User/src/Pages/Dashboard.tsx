import { useEffect, useState } from "react"
import api from "@/lib/axios"
import Attendance from "@/components/Attendance"

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me", { withCredentials: true })
        setUser(res.data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }
    fetchUser()
  }, [])

  if (!user) {
    return <p>Loading...</p>  // jab tak data nahi aata
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <Attendance userId={user.id} />
    </div>
  )
}

export default Dashboard
