import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { Button } from "@/components/ui/button";
import { MdDeleteSweep, MdEditSquare } from "react-icons/md";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import Loader from "@/components/Loader";
import { projectRepo } from "@/repositories/projectRepo";


interface Project {
  _id: string;
  title: string;
  description: string;
  teamName: {
    _id: string;
    teamName: string;
  };
  PM: {
    _id: string;
    name: string;
  };
}


const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamName: "",
    PM: "",
  });

  const fetchProjects = async () => {
    try {
      const data = await projectRepo.getAllProjects();
      setProjects(data || []);
    } catch {
      message.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      teamName: "",
      PM: "",
    });
    setErrors({});
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await projectRepo.updateProject(editingId, formData);
        message.success("Project updated successfully");
      } else {
        await projectRepo.createProject(formData);
        message.success("Project assigned successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchProjects();
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
      title: "Are you sure you want to delete this project?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await projectRepo.deleteProject(id);
          setProjects((prev) => prev.filter((p) => p._id !== id));
          message.success("Project deleted successfully");
        } catch {
          message.error("Failed to delete project");
        }
      },
    });
  };

  const openEditModal = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      teamName: project.teamName?.teamName || "",
      PM: project.PM?.name || "",
    });
    setEditingId(project._id);
    setIsModalOpen(true);
  };


  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6">
      <UrlBreadcrumb />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>Assign Project</Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-neutral-900 shadow rounded-lg p-4"
              >
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <p className="text-gray-600 text-sm mt-2">
                  {project.description}
                </p>
                <p className="text-sm mt-2">
                  <strong>Team:</strong> {project.teamName?.teamName}
                </p>
                <p className="text-sm">
                  <strong>Project Manager:</strong> {project.PM?.name}
                </p>
                <div className="flex justify-start gap-2 mt-4">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => openEditModal(project)}
                    className="cursor-pointer rounded-full"
                  >
                    <MdEditSquare className="text-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(project._id)}
                    className="cursor-pointer rounded-full"
                  >
                    <MdDeleteSweep className="text-white" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No projects found</p>
          )}

        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <span className="text-xl font-semibold mb-3 text-center">
            {editingId ? "Edit Project" : "Assign Project"}
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
        <div className="grid grid-cols-1 gap-6 mb-6 mt-7">
          {[
            { name: "title", label: "Title", type: "text" },
            { name: "teamName", label: "Team Name", type: "text" },
            { name: "PM", label: "Project Manager", type: "text" },
          ].map((input) => (
            <div key={input.name} className="relative z-0 w-full group">
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 ${errors[input.name] ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=" "
                autoComplete="off"
              />
              <label
                htmlFor={input.name}
                className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${(formData as any)[input.name]
                  ? "-translate-y-6 scale-75 text-blue-600"
                  : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                  }`}
              >
                {input.label}
              </label>
              {errors[input.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[input.name]}
                </p>
              )}
            </div>
          ))}

          <div className="relative z-0 w-full group">
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 ${errors.description ? "border-red-500" : "border-gray-300"
                }`}
              placeholder=" "
            />
            <label
              htmlFor="description"
              className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${formData.description
                ? "-translate-y-6 scale-75 text-blue-600"
                : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                }`}
            >
              Description
            </label>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        <Button
          className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
          onClick={handleSave}
        >
          {editingId ? "Update Project" : "Assign Project"}
        </Button>
      </Modal>
    </div>
  );
};

export default Projects;
