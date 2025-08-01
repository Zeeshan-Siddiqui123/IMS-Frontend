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
  type: string
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
    type: "",
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
      type: "",
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
                  <TableHead className="text-right">Actions</TableHead>
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


        <Modal
          title={
            <span className="text-xl font-semibold mb-3 text-center">
              {editingId ? "Edit User" : "Create Account"}
            </span>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
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
              !editingId && { name: "password", label: "Password", type: "password" },
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
                    className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0
      ${errors[input.name] ? "border-red-500" : "border-gray-300"}
    `}
                    placeholder=" " // ye chahiye floating ke liye
                    autoComplete="off"
                  />
                  <label
                    htmlFor={input.name}
                    className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 
      ${(formData as any)[input.name]
                        ? "-translate-y-6 scale-75 text-blue-600"
                        : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                      }`}
                  >
                    {input.label}
                  </label>
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

    </>
  )
}

export default Students
