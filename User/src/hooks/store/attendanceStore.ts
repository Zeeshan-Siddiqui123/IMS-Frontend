// store/attendanceStore.ts
import { create } from 'zustand'

interface AttendanceRecord {
  status: string
  checkInTime?: string
  checkOutTime?: string
  date?: string
}

interface AttendanceState {
  attendance: AttendanceRecord | null
  isLoading: boolean
  setAttendance: (attendance: AttendanceRecord | null) => void
  setLoading: (loading: boolean) => void
  clearAttendance: () => void
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: null,
  isLoading: false,
  setAttendance: (attendance) => set({ attendance, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAttendance: () => set({ attendance: null, isLoading: false }),
}))