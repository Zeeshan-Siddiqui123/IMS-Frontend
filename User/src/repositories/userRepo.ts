// repositories/userRepo.ts
import api from "../lib/axios"

interface SignUpData {
  name: string
  bq_id: string
  email: string
  password: string
  phone: string
  CNIC: string
  course: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    bq_id: string
    phone: string
    CNIC: string
    course: string
  }
  message?: string
}

interface MeResponse {
  data: {
    id: string
    name: string
    email: string
    bq_id: string
    phone: string
    CNIC: string
    course: string
  }
}

export class UserRepo {
  // private readonly baseUrl = "/user"

  async addUser(userData: SignUpData) {
    const { data } = await api.post(`signup`, userData)
    return data
  }

  async loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post(`login`, credentials, {
      withCredentials: true,
    })
    return data
  }

  async me(): Promise<MeResponse> {
    const { data } = await api.get(`me`, {
      withCredentials: true,
    })
    return data
  }

  async updateUser(id: string, userData: Partial<SignUpData>) {
    const { data } = await api.put(`update/${id}`, userData, {
      withCredentials: true,
    })
    return data
  }

  async getCourses(): Promise<string[]> {
    const { data } = await api.get(`course`)
    return data
  }

  async logout() {
    const { data } = await api.post(`logout`, {}, {
      withCredentials: true,
    })
    return data
  }
}

export const userRepo = new UserRepo()