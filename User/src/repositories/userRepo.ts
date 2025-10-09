import api from "../lib/axios"

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

  async loginUser(userData: any) {
    const response = await api.post("/user/login", userData)
    return response.data
  }

  async me() {
    const response = await api.get("/user/me")
    return response.data
  }

  async getCourses(){
    const response = await api.get("/user/course")
    return response.data
  }
 
}



// Create a single instance to use everywhere
export const userRepo = new UserRepo()
