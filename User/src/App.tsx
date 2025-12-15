// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SignUp from "./auth/SignUp"
import Login from "./auth/Login"
import PrivateRoute from "./auth/PrivateRoute"
import Dashboard from "./Pages/Dashboard"
import UserLayout from "./components/layout/userLayout"
import Attendance from "./Pages/Attendance"
import Posts from "./Pages/Posts"
import Profile from "./Pages/Profile"
import Direct from "./Pages/Direct"
import Activities from "./Pages/Activities"
import Notifications from "./Pages/Notifications"

import { Toaster } from "@/components/ui/sonner"

import { useEffect } from "react";
import OneSignal from 'react-onesignal';

const App = () => {
  useEffect(() => {
    // Initialize OneSignal
    OneSignal.init({
      appId: "62b37eb6-08ac-40c0-8099-3ea1d1959dd6",
      safari_web_id: "web.onesignal.auto.186ea02a-f890-410a-b109-aa22c180382d",
      notifyButton: {
        enable: true,
      } as any,
      allowLocalhostAsSecureOrigin: true,
    }).then(() => {
      console.log("OneSignal initialized");
      // Optional: Get Player ID
      OneSignal.Slidedown.promptPush();
    });
  }, []);
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<PrivateRoute> <UserLayout /> </PrivateRoute>}>
          <Route index element={<Dashboard />} />

          {/* No need to pass userId prop anymore */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/direct" element={<Direct />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App