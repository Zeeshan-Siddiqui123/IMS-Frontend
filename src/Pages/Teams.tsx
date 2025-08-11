import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { message, Modal, Select } from "antd"
import { teamRepo } from "@/repositories/teamRepo"
import { userRepo } from "@/repositories/userRepo"
import Loader from "@/components/Loader"
import UrlBreadcrumb from "@/components/UrlBreadcrumb"
import { MdDeleteSweep, MdEditSquare } from "react-icons/md"

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fieldEnumValues, setFieldEnumValues] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    teamName: "",
    teamLeader: "",
    members: [] as string[],
    field: ""
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [memberSearch, setMemberSearch] = useState("")

  console.log(memberSearch);
  

  const fetchTeams = async () => {
    try {
      const data = await teamRepo.getAllTeams()
      setTeams(data)
      setLoading(false)
    } catch {
      message.error("Failed to fetch teams")
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const users = await userRepo.getAllUsers()
      setAllUsers(users)
    } catch {
      message.error("Failed to fetch users")
    }
  }

  useEffect(() => {
    fetchTeams()
    fetchUsers()
  }, [])


  const fetchFields = async () => {
    try {
      const fields = await teamRepo.getfields()
      setFieldEnumValues(fields)
    } catch {
      message.error("Failed to fetch users")
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await teamRepo.updateTeam(editingId, formData)
        message.success("Team updated successfully")
      } else {
        await teamRepo.addTeams(formData)
        message.success("Team added successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchTeams()
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
      title: "Are you sure you want to delete this team?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await teamRepo.deleteTeam(id)
          setTeams((prev) => prev.filter((team) => team._id !== id))
          message.success("Team deleted successfully")
        } catch {
          message.error("Failed to delete team")
        }
      },
    })
  }


  const openEditModal = (team: any) => {
    setFormData({
      teamName: team.teamName,
      teamLeader: team.teamLeader,
      members: team.members.map((m: any) => m._id || m),
      field: team.field
    });
    setEditingId(team._id);
    setIsModalOpen(true);
  };


  const resetForm = () => {
    setFormData({ teamName: "", teamLeader: "", members: [], field: "" })
    setEditingId(null)
    setMemberSearch("")
  }

  // Filter users based on search input

  return (
    <div className="min-h-screen w-full p-6">
      <UrlBreadcrumb />
      <div className="flex justify-between items-center mb-6 mt-5">
        <h2 className="text-2xl font-bold">Registered Teams</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Team</Button>
      </div>

      <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900">
        {loading ? (
          <Loader />
        ) : (
          <Table>
            <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Team Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Field</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length > 0 ? (
                teams.map((team, index) => (
                  <TableRow key={team._id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{team.teamName}</TableCell>
                    <TableCell>{team.teamLeader}</TableCell>
                    <TableCell>
                      {team.members && team.members.length > 0
                        ? team.members.map((m: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block mr-1 text-sm bg-gray-200 px-2 py-1 rounded"
                          >
                            {m.name || m}
                          </span>
                        ))
                        : "—"}
                    </TableCell>
                    <TableCell>{team.field}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        onClick={() => openEditModal(team)}
                        size="icon"
                        className="rounded-full"
                      >
                        <MdEditSquare className="text-white" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(team._id)}
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                      >
                        <MdDeleteSweep className="text-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No teams found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>


      {/* Ant Design Modal */}
      <Modal
        title={
          <span className="text-xl font-semibold mb-3 text-center">
            {editingId ? "Edit Team" : "Create Team"}
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
          {/* Text Inputs */}
          {[
            { name: "teamName", label: "Team Name", type: "text" },
            { name: "teamLeader", label: "Team Leader", type: "text" },
          ].map((input) => (
            <div key={input.name} className="relative z-0 w-full group">
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 
            text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0
            ${errors[input.name] ? "border-red-500" : "border-gray-300"}`}
                placeholder=" "
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

          {/* Field Dropdown */}
          {/* Field Dropdown using AntD Select */}
          <div className="relative z-0 w-full group">
            <Select
              placeholder="Select Field"
              value={formData.field || undefined}
              onChange={(value) => setFormData((prev) => ({ ...prev, field: value }))}
              options={fieldEnumValues.map((field) => ({
                label: field,
                value: field,
              }))}
              style={{ width: "100%" }}
              className="border-b-2 border-gray-300 focus:border-blue-600 bg-transparent"
            />
            <label
              htmlFor="field"
              className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 
      ${formData.field
                  ? "-translate-y-6 scale-75 text-blue-600"
                  : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                }`}
            >
              {/* Field */}
            </label>
            {errors.field && <p className="text-red-500 text-xs mt-1">{errors.field}</p>}
          </div>



          {/* Members Multi-Select */}
          <div className="relative z-0 w-full group">
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Select members"
              value={Array.isArray(formData.members) ? formData.members : []}
              onChange={(selectedValues: string[]) => {
                setFormData((prev) => ({ ...prev, members: selectedValues }));
              }}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={allUsers.map((user) => ({
                label: user.name,
                value: user._id,
              }))}
              style={{ width: "100%" }}
              className="border-b-2 border-gray-300 focus:border-blue-600 bg-transparent"
            />
            {/* <label className="block mt-1 text-gray-500 text-sm">Members</label> */}
            {errors.members && (
              <p className="text-red-500 text-xs mt-1">{errors.members}</p>
            )}
          </div>
        </div>

        <Button
          className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
          onClick={handleSave}
        >
          {editingId ? "Update Team" : "Create Team"}
        </Button>
      </Modal>



    </div>
  )
}

export default Teams
