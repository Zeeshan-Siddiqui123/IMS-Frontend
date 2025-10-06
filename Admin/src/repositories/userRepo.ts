import api from "@/lib/axios"

export class UserRepo {
  // Fetch all users
  async getAllUsers() {
    const response = await api.get("/user/signup")
    return response.data
  }

  // Add a new user
  async addUser(userData: any) {
    const response = await api.post("/user/signup", userData)
    return response.data
  }

  // Delete user by ID
  async deleteUser(id: string) {
    const response = await api.delete(`/user/delete/${id}`)
    return response.data
  }

  // Update user by ID (Optional)
  async updateUser(id: string, userData: any) {
    const response = await api.put(`/user/update/${id}`, userData)
    return response.data
  }

  async getAllUserStatus() {
    const response = await api.get("/user/status")
    return response.data
  }
}



// Create a single instance to use everywhere
export const userRepo = new UserRepo()
