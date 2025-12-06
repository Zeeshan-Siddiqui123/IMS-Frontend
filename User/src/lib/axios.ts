import axios from "axios"


const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://ims-server-sage.vercel.app",
  withCredentials: true,

})

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      if (message === "jwt expired" || message === "Invalid token" || message === "No token") {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const res = await api.post("/refresh-token");

          if (res.status === 200 && res.data.accessToken) {
            // Token refreshed successfully
            // Update session storage if that's where we keep it for client usage
            sessionStorage.setItem("token", res.data.accessToken);
            // Verify if we need to update state or if next request picks it up from storage/cookie
            // Original request headers might need updating if they carried the old token
            // But axios instance 'api' might pick up new cookie automatically if it relies on cookie
            // If we attach token manually in request interceptor (not shown here but common), we'd need to update header

            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clean up and redirect
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);


export default api