import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { message } from "antd"
import { CheckCircle2 } from "lucide-react"
import { attRepo } from "@/repositories/attRepo"

interface AttendanceData {
  status: string
  checkInTime: string | null
  checkOutTime: string | null
}

interface HistoryRecord {
  _id: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
}

interface Props {
  userId: string
}

const MarkAttendance: React.FC<Props> = ({ userId }) => {
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  // ✅ Load today's attendance on mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attRepo.getTodayStatus(userId)
        setAttendance(res || null)
      } catch (err: any) {
        console.error(err)
      }
    }
    fetchAttendance()
  }, [userId])

  // ✅ Load user attendance history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true)
      try {
        const res = await attRepo.getUserHistory(userId)
        setHistory(res.history || [])
      } catch (err: any) {
        console.error(err)
      } finally {
        setIsHistoryLoading(false)
      }
    }
    fetchHistory()
  }, [userId])

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const res = await attRepo.checkIn(userId)
      setAttendance(res.att)
      message.success("Checked in successfully!")
      refreshHistory()
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const res = await attRepo.checkOut(userId)
      setAttendance(res.att)
      message.success("Checked out successfully!")
      refreshHistory()
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-out failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Helper to reload history after checkin/checkout
  const refreshHistory = async () => {
    try {
      const res = await attRepo.getUserHistory(userId)
      setHistory(res.history || [])
    } catch (err) {
      console.error(err)
    }
  }

  const isCheckedIn = Boolean(attendance?.checkInTime)
  const isCheckedOut = Boolean(attendance?.checkOutTime)

  return (
    <div className="flex flex-col gap-6">
      {/* ✅ Buttons Row */}
      <div className="flex gap-4 items-center">
        {/* Check In Button */}
        {!isCheckedIn && (
          <Button onClick={handleCheckIn} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              "Check In"
            )}
          </Button>
        )}

        {/* Check Out Button */}
        {isCheckedIn && !isCheckedOut && (
          <Button onClick={handleCheckOut} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              "Check Out"
            )}
          </Button>
        )}

        {/* Checked Out Status */}
        {isCheckedOut && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" /> Checked Out
          </div>
        )}
      </div>

      {/* ✅ Status Card */}
      {isCheckedIn && (
        <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm text-sm mt-2 w-fit">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {attendance?.status || (isCheckedOut ? "Checked Out" : "Checked In")}
          </p>
          <p>
            <span className="font-semibold">Check-in Time:</span>{" "}
            {attendance?.checkInTime
              ? new Date(attendance.checkInTime).toLocaleTimeString()
              : "—"}
          </p>
          <p>
            <span className="font-semibold">Check-out Time:</span>{" "}
            {attendance?.checkOutTime
              ? new Date(attendance.checkOutTime).toLocaleTimeString()
              : "Not checked out yet"}
          </p>
        </div>
      )}
    </div>
  )
}

export default MarkAttendance
