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

const Attendance: React.FC<Props> = ({ userId }) => {
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

  return (
    <div className="flex flex-col gap-6">

      {/* ✅ User History Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Attendance History</h2>
        {isHistoryLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-200 dark:bg-neutral-700">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Check In</th>
                  <th className="p-2 text-left">Check Out</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record._id} className="border-t">
                    <td className="p-2">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString()
                        : "—"}
                    </td>
                    <td className="p-2">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString()
                        : "—"}
                    </td>
                    <td className="p-2">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance
