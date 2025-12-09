type APPNAME = String

export const APPNAME = "Incubation Management System"
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://bqims-backend.vercel.app"
)