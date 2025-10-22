import axios from "axios"


const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "https://ims-server-sage.vercel.app"
      : "http://localhost:3000",
  withCredentials: true,
})

export default api