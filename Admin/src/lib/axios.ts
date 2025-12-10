import axios from "axios"


const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://ims-backend-qmis.up.railway.app",

  withCredentials: true,
})

export default api