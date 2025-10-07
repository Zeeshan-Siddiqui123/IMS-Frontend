import api from "../lib/axios";

export class PostRepo {
  async getAllPosts() {
    const response = await api.get("/admin/post")
    return response.data
  }

  async getPostById(id: string) {
    const response = await api.get(`/admin/post/${id}`)
    return response.data
  }

  async createPost(postData: any) {
    const response = await api.post("/admin/post", postData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  async updatePost(id: string, postData: any) {
    const response = await api.put(`/admin/post/${id}`, postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  

  async deletePost(id: string) {
    const response = await api.delete(`/admin/post/${id}`)
    return response.data
  }
}

export const postRepo = new PostRepo()
