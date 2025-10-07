// lib/axios.ts
import axios from "axios"
import { message } from "antd"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/user",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          message.error("Session expired. Please login again.")
          window.location.href = "/login"
          break
        case 403:
          message.error("You don't have permission to access this resource")
          break
        case 404:
          message.error("Resource not found")
          break
        case 500:
          message.error("Server error. Please try again later.")
          break
        default:
          if (data?.message) {
            // Don't show message here, let components handle it
            console.error(data.message)
          }
      }
    } else if (error.request) {
      // Request made but no response
      message.error("Network error. Please check your connection.")
    } else {
      // Something else happened
      message.error("An unexpected error occurred")
    }

    return Promise.reject(error)
  }
)

export default api