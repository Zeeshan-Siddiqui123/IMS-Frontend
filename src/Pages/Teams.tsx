import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { message, Modal } from "antd"
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
  const [formData, setFormData] = useState({
    teamName: "",
    teamLeader: "",
    members: [] as string[],
    field: ""
  })
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({ ...prev, members: selected }))
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await teamRepo.updateTeam(editingId, formData)
        message.success("Team updated successfully")
      } else {
        await teamRepo.addTeams(formData)
        message.success("Team added successfully")
      }
      fetchTeams()
      setIsModalOpen(false)
      resetForm()
    } catch {
      message.error("Failed to submit team")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await teamRepo.deleteTeam(id)
      message.success("Deleted")
      fetchTeams()
    } catch {
      message.error("Failed to delete")
    }
  }

  const openEditModal = (team: any) => {
    setFormData({
      teamName: team.name,
      teamLeader: team.teamLeader,
      members: team.members.map((m: any) => m._id || m),
      field: team.field
    })
    setEditingId(team._id)
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({ teamName: "", teamLeader: "", members: [], field: "" })
    setEditingId(null)
  }
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
              {teams.map((team, index) => (
                <TableRow key={team._id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell>{team.teamLeader}</TableCell>
                  <TableCell>
                    {team.members && team.members.length > 0
                      ? team.members.map((m: any, i: number) => (
                          <span key={i} className="inline-block mr-1 text-sm bg-gray-200 px-2 py-1 rounded">
                            {m.name || m}
                          </span>
                        ))
                      : "—"}
                  </TableCell>
                  <TableCell>{team.field}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button onClick={() => openEditModal(team)} size="icon" className="rounded-full">
                      <MdEditSquare className="text-white" />
                    </Button>
                    <Button onClick={() => handleDelete(team._id)} variant="destructive" size="icon" className="rounded-full">
                      <MdDeleteSweep className="text-white" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Ant Design Modal */}
      <Modal
        open={isModalOpen}
        title={editingId ? "Edit Team" : "Add Team"}
        onCancel={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        onOk={handleSubmit}
        okText={editingId ? "Update" : "Create"}
      >
        {/* Team Name */}
        <div className="mb-4">
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
          />
        </div>

        {/* Team Leader */}
        <div className="mb-4">
          <Label htmlFor="teamLeader">Team Leader</Label>
          <Input
            name="teamLeader"
            value={formData.teamLeader}
            onChange={handleChange}
          />
        </div>

        {/* Members */}
        <div className="mb-4">
          <Label htmlFor="members">Members</Label>
          <select
            multiple
            name="members"
            value={formData.members}
            onChange={handleMultiSelectChange}
            className="w-full border border-gray-300 rounded px-2 py-2"
          >
            {allUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Field */}
        <div className="mb-4">
          <Label htmlFor="field">Field</Label>
          <Input
            name="field"
            value={formData.field}
            onChange={handleChange}
          />
        </div>
      </Modal>
    </div>
  )
}

export default Teams