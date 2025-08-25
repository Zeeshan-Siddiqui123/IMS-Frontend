import api from "@/lib/axios"

export class ProjectRepo {
  // Fetch all projects
  async getAllProjects() {
    const response = await api.get("/admin/project")
    return response.data
  }
  // Add a new user
  async createProject(projectData: any) {
    const response = await api.post("/admin/createproject", projectData)
    return response.data
  }

  // Delete user by ID
  async deleteProject(id: string) {
    const response = await api.delete(`/admin/project/${id}`)
    return response.data
  }

  // Update user by ID (Optional)
  async updateProject(id: string, projectData: any) {
    const response = await api.put(`/admin/project/${id}`, projectData)
    return response.data
  }
}

export const projectRepo = new ProjectRepo()
