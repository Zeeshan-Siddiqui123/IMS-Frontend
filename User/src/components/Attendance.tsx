// components/Attendance.tsx
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { message } from "antd"
import { attRepo } from "@/repositories/attRepo"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { useAttendanceStore } from "@/hooks/store/attendanceStore"

interface Props {
  userId: string
}

const Attendance: React.FC<Props> = ({ userId }) => {
  const { attendance, isLoading, setAttendance, setLoading } = useAttendanceStore()

  useEffect(() => {
    // const fetchAttendance = async () => {
    //   setLoading(true)
    //   try {
    //     const res = await attRepo.getTodayAttendance(userId)
    //     setAttendance(res.attendance)
    //   } catch (error: any) {
    //     console.error("Failed to fetch attendance:", error)
    //     if (error.response?.status !== 404) {
    //       message.error("Failed to load attendance data")
    //     }
    //     setAttendance(null)
    //   }
    // }
    // fetchAttendance()
  }, [userId, setAttendance, setLoading])

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const res = await attRepo.checkIn(userId)
      setAttendance(res.att)
      message.success("Checked in successfully!")
    } catch (err: any) {
      message.error(err.response?.data?.error || "Check-in failed")
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
      setLoading(false)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Not yet"
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50"
      case "checked-in":
        return "text-blue-600 bg-blue-50"
      case "completed":
        return "text-purple-600 bg-purple-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const isCheckedIn = !!attendance?.checkInTime
  const isCheckedOut = !!attendance?.checkOutTime

  return (
    <div className="">
      <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attendance Panel
            </h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Status Card */}
        {attendance ? (
          <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  attendance.status
                )}`}
              >
                {attendance.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Check In */}
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`w-5 h-5 mt-0.5 ${
                    isCheckedIn ? "text-green-600" : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Check In
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatTime(attendance.checkInTime)}
                  </p>
                </div>
              </div>

              {/* Check Out */}
              <div className="flex items-start gap-3">
                <XCircle
                  className={`w-5 h-5 mt-0.5 ${
                    isCheckedOut ? "text-red-600" : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Check Out
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatTime(attendance.checkOutTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-8 text-center rounded-lg bg-gray-50 dark:bg-neutral-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No attendance record for today
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Click the button below to check in
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || isCheckedIn}
            className="h-12 text-base font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 transition-all"
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
            // disabled={isLoading || !isCheckedIn || isCheckedOut}
            className="h-12 text-base font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 transition-all"
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

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Make sure to check in when you arrive and check out
            when you leave. Your attendance will be automatically recorded.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Attendance