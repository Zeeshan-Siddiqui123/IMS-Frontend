// components/Attendance.tsx
import React from "react"
import { Button } from "@/components/ui/button"
import { message } from "antd"
import { attRepo } from "@/repositories/attRepo"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAttendanceStore } from "@/hooks/store/attendanceStore"

interface Props {
  userId: string
}

const Attendance: React.FC<Props> = ({ userId }) => {
  const { attendance, isLoading, setAttendance, setLoading } = useAttendanceStore()

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const res = await attRepo.checkIn(userId)
      setAttendance(res.att)
      message.success("Checked in successfully!")
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const res = await attRepo.checkOut(userId)
      setAttendance(res.att)
      message.success("Checked out successfully!")
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  const isCheckedIn = !!attendance?.checkInTime
  const isCheckedOut = !!attendance?.checkOutTime

  return (
    <div className="flex gap-4">
      <Button
        onClick={handleCheckIn}
        disabled={isLoading || isCheckedIn}
      >
        {isLoading && !isCheckedIn ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Processing...
          </span>
        ) : isCheckedIn ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Checked In
          </span>
        ) : (
          "Check In"
        )}
      </Button>

      <Button
        onClick={handleCheckOut}
        disabled={isLoading || !isCheckedIn || isCheckedOut}
      >
        {isLoading && isCheckedIn && !isCheckedOut ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Processing...
          </span>
        ) : isCheckedOut ? (
          <span className="flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Checked Out
          </span>
        ) : (
          "Check Out"
        )}
      </Button>
    </div>
  )
}

export default Attendance
