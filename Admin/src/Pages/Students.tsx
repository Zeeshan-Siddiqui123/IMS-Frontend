import React, { useEffect, useState } from "react"
import { message, Modal } from "antd"
import { Button } from "@/components/ui/button"
import { MdDeleteSweep, MdEditSquare } from "react-icons/md"
import { CiUnread, CiRead } from "react-icons/ci"
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

interface User {
  _id: string
  name: string
  bq_id: string
  type: string
  email: string
  phone: string
  CNIC: string
  course: string
  status?: string // API se aayega
}

const Students: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [statusData, setStatusData] = useState<any[]>([]) // status data
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    bq_id: "",
    email: "",
    type: "",
    password: "",
    phone: "",
    CNIC: "",
    course: "",
  })

  // ✅ Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Fetch Users + Status
  const fetchUsers = async () => {
    try {
      const data = await userRepo.getAllUsers()
      const status = await userRepo.getAllUserStatus()
      setUsers(data || [])
      setStatusData(status || [])
    } catch {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Reset form
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
    })
    setErrors({})
    setEditingId(null)
  }

  // ✅ Save (Add / Update)
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

  // ✅ Delete User
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

  // ✅ Open Edit Modal
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
    })
    setEditingId(user._id)
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchUsers()

    // ✅ optional: auto-refresh attendance every 1 min
    const interval = setInterval(fetchUsers, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen w-full p-6">
      <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900">
        {loading ? (
          <Loader />
        ) : (
          <Table>
            <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>BQ Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Course</TableHead>
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
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{user.bq_id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.CNIC}</TableCell>
                      <TableCell>{user.course}</TableCell>
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
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ✅ Modal Form */}
      <Modal
        title={
          <span className="text-xl font-semibold mb-3 text-center">
            {editingId ? "Edit User" : "Create Account"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-7">
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "bq_id", label: "BQ ID", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "CNIC", label: "CNIC", type: "text" },
            { name: "course", label: "Course", type: "text" },
            !editingId && {
              name: "password",
              label: "Password",
              type: showPassword ? "text" : "password",
            },
          ]
            .filter(Boolean)
            .map((input: any) => (
              <div key={input.name} className="relative z-0 w-full group">
                <input
                  type={input.type}
                  name={input.name}
                  id={input.name}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 ${
                    errors[input.name] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder=" "
                  autoComplete="off"
                />
                <label
                  htmlFor={input.name}
                  className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${
                    (formData as any)[input.name]
                      ? "-translate-y-6 scale-75 text-blue-600"
                      : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                  }`}
                >
                  {input.label}
                </label>

                {input.name === "password" && (
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-3 text-gray-500 cursor-pointer text-sm select-none"
                  >
                    {showPassword ? <CiUnread color="gray" /> : <CiRead color="black" />}
                  </span>
                )}
                {errors[input.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
                )}
              </div>
            ))}
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
