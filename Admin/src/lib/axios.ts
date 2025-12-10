import axios from "axios"


const api = axios.create({
  baseURL: "https://ims-backend-qmis.up.railway.app",
  withCredentials: true,
})

export default api