import React, { useEffect, useState } from "react"
import { message, Modal, Spin } from "antd"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { userRepo } from "@/repositories/userRepo"

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
  const [errors, setErrors] = useState({})

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
    } catch (error) {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      await userRepo.addUser(formData)
      message.success("User added successfully")
      setIsModalOpen(false)
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
      fetchUsers()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Backend validation errors
        setErrors(error.response.data.errors)
      } else {
        message.error(error.response?.data?.message )
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
        } catch (error) {
          message.error("Failed to delete user")
        }
      },
    })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen w-full p-6 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registered Users</h2>
          <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
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
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* MODAL FORM */}
        <Modal
          title="Create Account"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
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
              <input
                key={input.name}
                type={input.type || "text"}
                name={input.name}
                placeholder={input.placeholder}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <Button className="mt-4" onClick={handleAddUser}>
              Create User
            </Button>
          </div>
        </Modal>
      </div>
    </SidebarProvider>
  )
}

export default Students
