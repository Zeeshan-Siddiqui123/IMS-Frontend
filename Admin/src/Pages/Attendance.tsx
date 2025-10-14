import { useEffect, useState } from "react"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { Button } from "@/components/ui/button"
import { Input, message } from "antd"

const Attendance = () => {
  const [searchName, setSearchName] = useState("")
  const [userHistory, setUserHistory] = useState<any[]>([])
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 🔍 Search by Name
  const handleSearch = async () => {
    if (!searchName.trim()) {
      // 🔁 If search is empty, show all history again
      setUserHistory(allHistory)
      return
    }

    try {
      setLoading(true)
      const res = await attendanceRepo.getUserHistoryByName(searchName)

      const historyArray = Array.isArray(res)
        ? res
        : res?.history || []

      setUserHistory(historyArray)
    } catch (error) {
      console.error("Error fetching user history:", error)
      message.error("Failed to fetch user history")
    } finally {
      setLoading(false)
    }
  }

  // 📥 Fetch All History on Mount
  const fetchAllHistory = async () => {
    try {
      setLoading(true)
      const data = await attendanceRepo.getAttendanceHistory()
      setAllHistory(data || [])
      setUserHistory(data || []) 
    } catch (error) {
      console.error("Error fetching all history:", error)
      message.error("Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllHistory()
  }, [])

  return (
    <div className="p-6 space-y-4">
      {/* 🔍 Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter User Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* 📊 Table */}
      {userHistory.length > 0 ? (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Check In</th>
              <th className="p-2 border">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {userHistory.map((record, index) => (
              <tr key={index}>
                <td className="p-2 border">
                  {record.user?.name || "—"}
                </td>
                <td className="p-2 border">
                  {record.date
                    ? new Date(record.date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 border">{record.status || "—"}</td>
                <td className="p-2 border">
                  {record.checkInTime
                    ? new Date(record.checkInTime).toLocaleTimeString()
                    : "—"}
                </td>
                <td className="p-2 border">
                  {record.checkOutTime
                    ? new Date(record.checkOutTime).toLocaleTimeString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No attendance history found.</p>
      )}
    </div>
  )
}

export default Attendance
