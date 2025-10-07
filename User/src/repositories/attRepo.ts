import api from "../lib/axios"


export class AttRepo {
  async checkIn(userId: string) {
    const response = await api.post(`checkin/${userId}`)
    return response.data
  }


  async checkOut(userId: string) {
    const response = await api.post(`checkout/${userId}`)
    return response.data
  }


  // async getTodayAttendance(userId: string) {
  //   const response = await api.get(`/attendance/${userId}`)
  //   return response.data
  // }

  // async getUserAttendanceHistory(userId: string) {
  //   const response = await api.get(`/attendance/history/${userId}`)
  //   return response.data
  // }
}

// Create a single instance to use everywhere
export const attRepo = new AttRepo()
