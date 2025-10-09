import React, { useEffect, useState } from "react"
import { message, Select } from "antd"
import { CiUnread, CiRead } from "react-icons/ci"
import { userRepo } from "../repositories/userRepo"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"

const { Option } = Select

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [courses, setCourses] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    bq_id: "",
    email: "",
    password: "",
    phone: "",
    CNIC: "",
    course: "",
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await userRepo.getCourses()
        setCourses(res)
      } catch (err) {
        message.error("Failed to load courses")
      }
    }
    fetchCourses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCourseChange = (value: string) => {
    setFormData((prev) => ({ ...prev, course: value }))
  }

  const handleSubmit = async () => {
    try {
      await userRepo.addUser(formData)
      message.success("User registered successfully")
      setFormData({
        name: "",
        bq_id: "",
        email: "",
        password: "",
        phone: "",
        CNIC: "",
        course: "",
      })
      setErrors({})
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        message.error(error.response?.data?.message || "Registration failed")
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 rounded-lg border shadow bg-white dark:bg-neutral-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      <div className="space-y-4 mb-6">
        {[
          { name: "name", label: "Full Name", type: "text", placeholder: "Enter your full name" },
          { name: "bq_id", label: "BQ ID", type: "text", placeholder: "Enter your BQ ID" },
          { name: "email", label: "Email", type: "email", placeholder: "Enter your email address" },
          { name: "phone", label: "Phone", type: "text", placeholder: "Enter your phone number" },
          { name: "CNIC", label: "CNIC", type: "text", placeholder: "Enter your CNIC" },
        ].map((input) => (
          <div key={input.name} className="w-full">
            <label htmlFor={input.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {input.label}
            </label>
            <input
              type={input.type}
              name={input.name}
              id={input.name}
              value={(formData as any)[input.name]}
              onChange={handleChange}
              placeholder={input.placeholder}
              className={`block w-full rounded-md border px-3 py-2 text-gray-900 dark:text-white dark:bg-neutral-800 
                focus:border-blue-600 focus:ring-blue-600 sm:text-sm
                ${errors[input.name] ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
              autoComplete="off"
            />
            {errors[input.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
            )}
          </div>
        ))}

        {/* Password Field with Eye Icon */}
        <div className="w-full">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`block w-full rounded-md border px-3 py-2 text-gray-900 dark:text-white dark:bg-neutral-800 
                focus:border-blue-600 focus:ring-blue-600 sm:text-sm
                ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
              autoComplete="off"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            >
              {showPassword ? <CiUnread /> : <CiRead />}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Ant Design Course Dropdown */}
        <div className="w-full">
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>
          <Select
            id="course"
            value={formData.course || undefined}
            onChange={handleCourseChange}
            placeholder="Select a course"
            className="w-full"
          >
            {courses.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>
          {errors.course && (
            <p className="text-red-500 text-xs mt-1">{errors.course}</p>
          )}
        </div>
      </div>

      <Button
        className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
        onClick={handleSubmit}
      >
        Sign Up
      </Button>
      <div>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            <u>Login</u>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp