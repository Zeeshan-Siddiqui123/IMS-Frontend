// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SignUp from "./auth/SignUp"
import Login from "./auth/Login"
import PrivateRoute from "./auth/PrivateRoute"
import Dashboard from "./Pages/Dashboard"
import UserLayout from "./components/layout/userLayout"
import Attendance from "./Pages/Attendance"

// import Attendance from "./components/Attendance"
import { useAuthStore } from "./hooks/store/authStore"
import Posts from "./Pages/Posts"


const App = () => {
  const { user } = useAuthStore() 

  // const { user } = useAuthStore()

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<PrivateRoute> <UserLayout /> </PrivateRoute>}>
          <Route index element={<Dashboard />} />

          {/* Add more protected routes here */}
          <Route path="/attendance" element={<Attendance userId={user?.id} />} />
          <Route path="/posts" element={<Posts />} />
          {/* <Route path="reports" element={<Reports />} /> */}
          {/* <Route path="profile" element={<Profile />} /> */}
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App