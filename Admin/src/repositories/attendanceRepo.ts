// src/repositories/attendanceRepo.ts
import api from "../lib/axios"

export class AttendanceRepo {
  // ✅ Get today's status of all users
  async getAllUserStatus() {
    const res = await api.get("/attendance/status")
    return res.data
  }

  // ✅ Get full attendance history (all users)
  async getAttendanceHistory() {
    const res = await api.get("/attendance/history")
    return res.data
  }

  // ✅ Get specific user history
  async getUserHistoryByName(name: string) {
    const res = await api.get(`/attendance/history/by-name/${name}`)
    return res.data
  }

  // ✅ Update attendance record (admin)
  async updateAttendanceRecord(attendanceId: string, data: any) {
    const res = await api.put(`/attendance/update/${attendanceId}`, data)
    return res.data
  }

  // ✅ Delete attendance record (admin)
  async deleteAttendanceRecord(attendanceId: string) {
    const res = await api.delete(`/attendance/delete/${attendanceId}`)
    return res.data
  }


}

export const attendanceRepo = new AttendanceRepo()
