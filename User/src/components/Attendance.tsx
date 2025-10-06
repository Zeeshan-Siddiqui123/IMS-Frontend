import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { message } from "antd"      // ✅ Ant Design message import
import { attRepo } from "@/repositories/attRepo"

interface AttendanceRecord {
  status: string
  checkInTime?: string
  checkOutTime?: string
}

interface Props {
  userId: string
}

const Attendance: React.FC<Props> = ({ userId }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ Fetch today's attendance on page load
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attRepo.getTodayAttendance(userId)
        setAttendance(res.attendance)
      } catch (error) {
        console.error("Failed to fetch attendance:", error)
        message.error("Failed to load attendance data")
      }
    }
    fetchAttendance()
  }, [userId])

  const handleCheckIn = async () => {
    try {
      setLoading(true)
      const res = await attRepo.checkIn(userId)
      setAttendance(res.att)
      message.success("✅ Checked in successfully")
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setLoading(true)
      const res = await attRepo.checkOut(userId)
      setAttendance(res.att)
      message.success("✅ Checked out successfully")
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">🕒 Attendance Panel</h1>

        {attendance ? (
          <div className="mb-4 text-gray-700">
            <p>
              <strong>Status:</strong> {attendance.status}
            </p>
            {attendance.checkInTime && (
              <p>
                <strong>Check-In:</strong>{" "}
                {new Date(attendance.checkInTime).toLocaleTimeString()}
              </p>
            )}
            {attendance.checkOutTime && (
              <p>
                <strong>Check-Out:</strong>{" "}
                {new Date(attendance.checkOutTime).toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <p className="mb-4 text-gray-500">No attendance record for today yet.</p>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <Button
            onClick={handleCheckIn}
            disabled={loading || !!attendance?.checkInTime}
            className="bg-green-600 hover:bg-green-700"
          >
            {attendance?.checkInTime ? "Checked In" : "Check In"}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={loading || !attendance?.checkInTime || !!attendance?.checkOutTime}
            className="bg-red-600 hover:bg-red-700"
          >
            {attendance?.checkOutTime ? "Checked Out" : "Check Out"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Attendance
