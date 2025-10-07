import { useEffect, useState } from "react"
import Attendance from "../components/Attendance"
import { userRepo } from "../repositories/userRepo"

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userRepo.me()
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
