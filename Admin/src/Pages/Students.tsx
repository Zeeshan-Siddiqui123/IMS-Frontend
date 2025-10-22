import React, { useEffect, useState } from "react"
import { message, Modal, Select, Radio } from "antd"
import { Button } from "@/components/ui/button"
import { MdDeleteSweep, MdEditSquare, MdPersonAdd } from "react-icons/md"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { userRepo } from "@/repositories/userRepo"
import Loader from "@/components/Loader"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { CiUnread, CiRead } from "react-icons/ci"

const { Option } = Select

interface User {
  _id: string
  name: string
  bq_id: string
  type: string
  email: string
  phone: string
  CNIC: string
  course: string
  gender: string
  shift: string
  status?: string
}

const Students: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [courses, setCourses] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const [shifts, setShifts] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    bq_id: "",
    email: "",
    type: "",
    password: "",
    phone: "",
    CNIC: "",
    course: "",
    gender: "",
    shift: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fetchUsers = async () => {
    try {
      const [usersData, status] = await Promise.all([
        userRepo.getAllUsers(),
        attendanceRepo.getAllUserStatus(),
      ])
      setUsers(usersData || [])
      setStatusData(status || [])
    } catch {
      message.error("Failed to fetch users or attendance")
      console.log(errors);
    } finally {
      setLoading(false)
    }
  }

  const fetchEnums = async () => {
    try {
      const res = await userRepo.getEnums()
      setCourses(res.courses || [])
      setGenders(res.genders || [])
      setShifts(res.shifts || [])
    } catch {
      message.error("Failed to load options")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      bq_id: "",
      email: "",
      type: "",
      password: "",
      phone: "",
      CNIC: "",
      course: "",
      gender: "",
      shift: "",
    })
    setErrors({})
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await userRepo.updateUser(editingId, formData)
        message.success("User updated successfully")
      } else {
        await userRepo.addUser(formData)
        message.success("User added successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        message.error(error.response?.data?.message || "Action failed")
      }
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await userRepo.deleteUser(id)
          setUsers((prev) => prev.filter((user) => user._id !== id))
          message.success("User deleted successfully")
        } catch {
          message.error("Failed to delete user")
        }
      },
    })
  }

  const openEditModal = (user: User) => {
    setFormData({
      name: user.name,
      bq_id: user.bq_id,
      email: user.email,
      type: user.type,
      password: "",
      phone: user.phone,
      CNIC: user.CNIC,
      course: user.course,
      gender: user.gender,
      shift: user.shift,
    })
    setEditingId(user._id)
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchUsers()
    fetchEnums()
  }, [])

  return (
    <div className="min-h-screen w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Manage Students
        </h2>
        <Button
          className="flex items-center gap-2 bg-black hover:bg-gray-700 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <MdPersonAdd /> Add User
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900">
        {loading ? (
          <Loader />
        ) : (
          <Table>
            <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>BQ Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Today Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user, index) => {
                  const status = statusData.find((s) => s._id === user._id)?.status
                  return (
                    <TableRow key={user._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{user.bq_id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.CNIC}</TableCell>
                      <TableCell>{user.course}</TableCell>
                      <TableCell>{user.gender}</TableCell>
                      <TableCell>{user.shift}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-center text-sm font-semibold ${
                            status === "Present"
                              ? "bg-green-100 text-green-600"
                              : status === "Absent"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          variant="default"
                          size="icon"
                          className="cursor-pointer rounded-full"
                          onClick={() => openEditModal(user)}
                        >
                          <MdEditSquare className="text-white" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="cursor-pointer rounded-full"
                          onClick={() => handleDelete(user._id)}
                        >
                          <MdDeleteSweep className="text-white" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ✅ Add/Edit Modal */}
      <Modal
        title={
          <span className="text-xl font-semibold">
            {editingId ? "Edit User" : "Add New User"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        footer={null}
        centered
      >
        <div className="space-y-4 mb-6 mt-6">
          {/* Inputs */}
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "bq_id", label: "BQ ID", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "CNIC", label: "CNIC", type: "text" },
          ].map((input) => (
            <div key={input.name}>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                {input.label}
              </label>
              <input
                type={input.type}
                name={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}

          {/* Password */}
          {!editingId && (
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <CiUnread /> : <CiRead />}
                </span>
              </div>
            </div>
          )}

          {/* Course Dropdown */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Course
            </label>
            <Select
              value={formData.course || undefined}
              onChange={(value) => handleSelectChange("course", value)}
              placeholder="Select a course"
              className="w-full"
            >
              {courses.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <Radio.Group
              onChange={(e) => handleSelectChange("gender", e.target.value)}
              value={formData.gender}
            >
              {genders.map((g) => (
                <Radio key={g} value={g} className="mr-4">
                  {g}
                </Radio>
              ))}
            </Radio.Group>
          </div>

          {/* Shift */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Shift
            </label>
            <Radio.Group
              onChange={(e) => handleSelectChange("shift", e.target.value)}
              value={formData.shift}
            >
              {shifts.map((s) => (
                <Radio key={s} value={s} className="mr-4">
                  {s}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        </div>

        <Button
          className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
          onClick={handleSave}
        >
          {editingId ? "Update User" : "Create User"}
        </Button>
      </Modal>
    </div>
  )
}

export default Students
