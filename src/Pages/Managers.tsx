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
import UrlBreadcrumb from "@/components/UrlBreadcrumb"
import { pmRepo } from "@/repositories/pmRepo"



interface PM {
  _id: string
  name: string
  email: string
  password: string
  role: string
  projects: string[]
}

const Managers: React.FC = () => {
  const [pms, setPms] = useState<PM[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    projects: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchPMs = async () => {
    try {
      const data = await pmRepo.getPMs()
      setPms(data || [])
    } catch {
      message.error("Failed to fetch PMs")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      projects: [],
    })
    setErrors({})
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await pmRepo.updatePM(editingId, formData)
        message.success("PM updated successfully")
      } else {
        await pmRepo.createPM(formData)
        message.success("PM added successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchPMs()
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
          await pmRepo.deletePM(id)
          setPms((prev) => prev.filter((pm) => pm._id !== id))
          message.success("PM deleted successfully")
        } catch {
          message.error("Failed to delete PM")
        }
      },
    })
  }

  const openEditModal = (pm: PM) => {
    setFormData({
      name: pm.name,
      email: pm.email,
      password: "",
      role: pm.role,
      projects: pm.projects as any,
    })
    setEditingId(pm._id)
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchPMs()
  }, [])

  return (
    <>



      <div className="min-h-screen w-full p-6">
        <UrlBreadcrumb />
        <div className="flex justify-between items-center mb-6 mt-5">
          <h2 className="text-2xl font-bold">Registered Project Managers</h2>
          <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">Add PM</Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pms.length > 0 ? (
                  pms.map((pm, index) => (
                    <TableRow key={pm._id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{pm.name}</TableCell>
                      <TableCell>{pm.email}</TableCell>
                      <TableCell>{pm.role}</TableCell>
                      <TableCell>{pm.projects.join(", ")}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => openEditModal(pm)}
                          className="cursor-pointer rounded-full"
                        >
                          <MdEditSquare className="text-white" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(pm._id)}
                          className="cursor-pointer rounded-full"

                        >
                          <MdDeleteSweep className="text-white" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No PMs found
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
              {editingId ? "Edit PM" : "Create PM"}
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
              { name: "email", label: "Email", type: "email" },
              { name: "role", label: "Role", type: "text" },
              { name: "projects", label: "Projects", type: "text" },
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
            {editingId ? "Update PM" : "Create PM"}
          </Button>
        </Modal>




      </div>

    </>
  )
}

export default Managers
