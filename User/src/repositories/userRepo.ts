import api from "@/lib/axios"

export class UserRepo {
  // Fetch all users
  // Add a new user (Sign Up)
  async addUser(userData: any) {
    const response = await api.post("/user/signup", userData)
    return response.data
  }

  // Login user
  async loginUser(credentials: { email: string; password: string }) {
    const response = await api.post("/user/login", credentials)
    return response.data
  }

  // Update user by ID
  async updateUser(id: string, userData: any) {
    const response = await api.put(`/user/update/${id}`, userData)
    return response.data
  }
}

// Create a single instance to use everywhere
export const userRepo = new UserRepo()
