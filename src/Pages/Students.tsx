import React, { useEffect, useState } from "react"
import { message, Modal, Spin } from "antd"
import { Button } from "@/components/ui/button"
import { MdDeleteSweep, MdEditSquare } from "react-icons/md"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { userRepo } from "@/repositories/userRepo"
import UrlBreadcrumb from "@/components/UrlBreadcrumb"



interface User {
  _id: string
  name: string
  bq_id: string
  username: string
  email: string
  phone: string
  CNIC: string
  course: string
}

const Students: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: "",
    bq_id: "",
    email: "",
    password: "",
    phone: "",
    CNIC: "",
    course: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchUsers = async () => {
    try {
      const data = await userRepo.getAllUsers()
      setUsers(data || [])
    } catch {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
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
  }, [])

  return (
    <>

      

        <div className="min-h-screen w-full p-6">
          <UrlBreadcrumb />
          <div className="flex justify-between items-center mb-6 mt-5">
            <h2 className="text-2xl font-bold">Registered Users</h2>
            <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">Add User</Button>
          </div>

          <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Spin size="large" />
              </div>
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <TableRow key={user._id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{user.bq_id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.CNIC}</TableCell>
                        <TableCell>{user.course}</TableCell>
                        <TableCell className="flex gap-2 justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="cursor-pointer"
                          >
                            <MdEditSquare className="text-white" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                            className="cursor-pointer"

                          >
                            <MdDeleteSweep className="text-white" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Modal Form */}
          <Modal
            title={editingId ? "Edit User" : "Create Account"}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            footer={null}
            centered
          >
            <div className="flex flex-col gap-4">
              {[
                { name: "name", placeholder: "Full Name" },
                { name: "bq_id", placeholder: "BQ ID" },
                { name: "email", placeholder: "Email", type: "email" },
                { name: "phone", placeholder: "Phone" },
                { name: "CNIC", placeholder: "CNIC" },
                { name: "course", placeholder: "Course" },
                { name: "password", placeholder: "Password", type: "password" },
              ].map((input) => (
                <div key={input.name}>
                  <input
                    type={input.type || "text"}
                    name={input.name}
                    placeholder={input.placeholder}
                    value={(formData as any)[input.name]}
                    onChange={handleChange}
                    className={`px-4 py-2 rounded-md bg-gray-100 border w-full ${errors[input.name] ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[input.name] && (
                    <p className="text-red-500 text-sm">{errors[input.name]}</p>
                  )}
                </div>
              ))}
              <Button className="mt-4 cursor-pointer" onClick={handleSave}>
                {editingId ? "Update User" : "Create User"}
              </Button>
            </div>
          </Modal>
        </div>
      
    </>
  )
}

export default Students
