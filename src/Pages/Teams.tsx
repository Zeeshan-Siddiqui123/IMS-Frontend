import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import { teamRepo } from "@/repositories/teamRepo";
import { userRepo } from "@/repositories/userRepo";
import { Input, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { MdDeleteSweep, MdEditSquare } from "react-icons/md";

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldEnumValues, setFieldEnumValues] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    teamName: "",
    teamLeader: "",
    members: [] as string[],
    field: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ===== API Calls =====
  const fetchTeams = async () => {
    try {
      const data = await teamRepo.getAllTeams();

      const formatted = data.map((team: any) => {
        const leader = team.members.find((m: any) => m.role === "Team Leader");
        const members = team.members.filter((m: any) => m.role === "Member");

        return {
          ...team,
          teamLeader: leader?.user, // UI ko direct user object milega
          members: members.map((m: any) => m.user) // sirf user objects rakho
        };
      });

      setTeams(formatted);
    } catch {
      message.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await userRepo.getAllUsers();
      setAllUsers(users);
    } catch {
      message.error("Failed to fetch users");
    }
  };

  const fetchFields = async () => {
    try {
      const fields = await teamRepo.getfields();
      setFieldEnumValues(fields);
    } catch {
      message.error("Failed to fetch fields");
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
    fetchFields();
  }, []);

  const handleSave = async () => {
    try {
      // ✅ Team Leader ko members array ke andar add karo
      const payload = {
        teamName: formData.teamName,
        field: formData.field,
        members: [
          {
            user: formData.teamLeader, // leader ka id
            role: "Team Leader"
          },
          ...formData.members
            .filter((id: string) => id !== formData.teamLeader) // leader ko dobara member na banaye
            .map((id: string) => ({
              user: id,
              role: "Member"
            }))
        ]
      };

      if (editingId) {
        await teamRepo.updateTeam(editingId, payload);
        message.success("Team updated successfully");
      } else {
        await teamRepo.addTeams(payload);
        message.success("Team added successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchTeams();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.message || "Action failed");
      }
    }
  };


  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this team?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await teamRepo.deleteTeam(id);
          setTeams(prev => prev.filter(team => team._id !== id));
          message.success("Team deleted successfully");
        } catch {
          message.error("Failed to delete team");
        }
      },
    });
  };

  const openEditModal = (team: any) => {
    const leader = team.members.find((m: any) => m.role === "Team Leader");
    const members = team.members.filter((m: any) => m.role === "Member");

    setFormData({
      teamName: team.teamName,
      teamLeader: leader?.user._id || "",
      members: members.map((m: any) => m.user._id),
      field: team.field
    });

    setEditingId(team._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ teamName: "", teamLeader: "", members: [], field: "" });
    setEditingId(null);
    setErrors({});
  };

  // ===== UI =====
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
                    <TableCell>{team.teamLeader?.name || "—"}</TableCell>
                    <TableCell>
                      {team.members?.length
                        ? team.members.map((m: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block mr-1 text-sm bg-gray-200 px-2 py-1 rounded"
                          >
                            {m?.name}
                          </span>
                        ))
                        : "—"}
                    </TableCell>

                    <TableCell>{team.field}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button onClick={() => openEditModal(team)} size="icon" className="rounded-full">
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

      {/* Modal */}
      <Modal
        title={<span className="text-xl font-semibold">{editingId ? "Edit Team" : "Create Team"}</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        footer={null}
        centered
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-7">
          {/* Team Name */}
          <Input
            placeholder="Team Name"
            value={formData.teamName}
            onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
          />
          {errors.teamName && <p className="text-red-500 text-xs">{errors.teamName}</p>}

          {/* Leader */}
          <Select
            placeholder="Select Team Leader"
            value={formData.teamLeader || undefined}
            onChange={(value) => setFormData((prev) => ({ ...prev, teamLeader: value }))}
            options={allUsers.map((user) => ({
              label: user.name,
              value: user._id
            }))}
            style={{ width: "100%" }}
          />
          {errors.teamLeader && <p className="text-red-500 text-xs">{errors.teamLeader}</p>}

          {/* Members */}
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Members"
            value={formData.members}
            onChange={(values) => setFormData((prev) => ({ ...prev, members: values }))}
            options={allUsers
              .filter((user) => user._id !== formData.teamLeader)
              .map((user) => ({
                label: user.name,
                value: user._id
              }))}
            style={{ width: "100%" }}
          />
          {errors.members && <p className="text-red-500 text-xs">{errors.members}</p>}

          {/* Field */}
          <Select
            placeholder="Select Field"
            value={formData.field || undefined}
            onChange={(value) => setFormData((prev) => ({ ...prev, field: value }))}
            options={fieldEnumValues.map((field) => ({
              label: field,
              value: field
            }))}
            style={{ width: "100%" }}
          />
          {errors.field && <p className="text-red-500 text-xs">{errors.field}</p>}
        </div>

        <Button className="w-full h-11 text-lg font-medium" onClick={handleSave}>
          {editingId ? "Update Team" : "Create Team"}
        </Button>
      </Modal>
    </div>
  );
};


export default Teams