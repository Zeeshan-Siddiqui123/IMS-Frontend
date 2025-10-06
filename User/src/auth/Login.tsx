import React, { useState } from "react"
import { message } from "antd"
import { CiUnread, CiRead } from "react-icons/ci"
import { userRepo } from "../repositories/userRepo"
import { Button } from "../components/ui/button"
import { Link, useNavigate } from "react-router-dom"

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }



  const handleSubmit = async () => {
    try {
      const data = await userRepo.loginUser(formData)
      message.success("Login successful")
      navigate("/")
    } catch (error: any) {
      message.error(error.response?.data?.message || "Login failed")
    }
  }
  return (
    <div className="max-w-md mx-auto p-6 mt-10 rounded-lg border shadow bg-white dark:bg-neutral-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      <div className="space-y-5 mb-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            placeholder="Enter your Valid Email"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none 
              ${errors.email ? "border-red-500" : "border-gray-300"}`}
            autoComplete="off"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-1 text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              placeholder="Enter your Password"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none 
                ${errors.password ? "border-red-500" : "border-gray-300"}`}
              autoComplete="off"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer text-lg select-none"
            >
              {showPassword ? <CiUnread /> : <CiRead />}
            </span>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
      </div>

      <Button
        className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
        onClick={handleSubmit}
      >
        Login
      </Button>

      <p className="text-center mt-3">
        Don't have an account?{" "}
        <Link to="/Signup" className="text-blue-600">
          <u>Create</u>
        </Link>
      </p>
    </div>
  )
}

export default Login
