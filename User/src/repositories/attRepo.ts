import api from "@/lib/axios"

export class AttRepo {
  // ✅ Check In user
  async checkIn(userId: string) {
    const response = await api.post(`/user/checkin/${userId}`)
    return response.data
  }

  // ✅ Check Out user
  async checkOut(userId: string) {
    const response = await api.post(`/user/checkout/${userId}`)
    return response.data
  }

  // ✅ Get today's attendance for a user
  async getTodayAttendance(userId: string) {
    const response = await api.get(`/attendance/${userId}`)
    return response.data
  }

  // ✅ (Optional) Get all attendance records for a user
    // → useful for history page / admin dashboard
  async getUserAttendanceHistory(userId: string) {
    const response = await api.get(`/attendance/history/${userId}`)
    return response.data
  }
}

// Create a single instance to use everywhere
export const attRepo = new AttRepo()
