import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { Button } from "@/components/ui/button";
import { postRepo } from "../repositories/postRepo";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import Loader from "@/components/Loader";

interface Post {
  _id: string;
  title: string;
  description: string;
  link: string;
}

const Posts = () => {
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });

  // 🧠 Fetch both admin & user posts
  const fetchPosts = async () => {
    try {
      const [adminData, userData] = await Promise.all([
        postRepo.getAllPosts(),
        postRepo.getAllUsersPosts(),
      ]);
      setAdminPosts(adminData || []);
      setUserPosts(userData || []);
    } catch {
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", link: "" });
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      const form = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
      };

      await postRepo.createUserPost(form);
      message.success("Post created successfully");

      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.message || "Failed to create post");
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPostCard = (post: Post) => (
    <div
      key={post._id}
      className="bg-white dark:bg-neutral-900 shadow rounded-lg p-4"
    >
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
        {post.description}
      </p>
      {post.link && (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm mt-2 inline-block"
        >
          Visit Link
        </a>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <UrlBreadcrumb />
      <div className="text-2xl font-bold mb-6">User Dashboard</div>

      {/* 👇 Tabs Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={activeTab === "admin" ? "default" : "outline"}
          onClick={() => setActiveTab("admin")}
          className={activeTab === "admin" ? "bg-blue-600 text-white" : ""}
        >
          📢 Admin Announcements
        </Button>
        <Button
          variant={activeTab === "user" ? "default" : "outline"}
          onClick={() => setActiveTab("user")}
          className={activeTab === "user" ? "bg-green-600 text-white" : ""}
        >
          👥 User Posts
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* 👇 Admin Posts Section */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-blue-600">
                📢 Announcements (Admin Posts)
              </h2>
              {adminPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminPosts.map(renderPostCard)}
                </div>
              ) : (
                <p className="text-gray-500">No admin posts found</p>
              )}
            </div>
          )}

          {/* 👇 User Posts Section */}
          {activeTab === "user" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-green-600">
                  👥 User Posts
                </h2>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Create Post
                </Button>
              </div>

              {userPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map(renderPostCard)}
                </div>
              ) : (
                <p className="text-gray-500">No user posts found</p>
              )}
            </div>
          )}
        </>
      )}

      {/* 🧩 Modal: Create Post */}
      <Modal
        title={
          <span className="text-xl font-semibold mb-3 text-center">
            Create Post
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
          {[{ name: "title", label: "Title", type: "text" },
          { name: "link", label: "Link", type: "text" }].map((input) => (
            <div key={input.name} className="relative z-0 w-full group">
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className={`peer block w-full border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-black focus:outline-none focus:ring-0 ${
                  errors[input.name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder=" "
                autoComplete="off"
              />
              <label
                htmlFor={input.name}
                className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${
                  (formData as any)[input.name]
                    ? "-translate-y-6 scale-75 text-black"
                    : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-black"
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
              className={`peer block w-full border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-black focus:outline-none focus:ring-0 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=" "
            />
            <label
              htmlFor="description"
              className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 ${
                formData.description
                  ? "-translate-y-6 scale-75 text-black"
                  : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-black"
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
          className="w-full h-11 text-lg font-medium bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md transition"
          onClick={handleCreate}
        >
          Create Post
        </Button>
      </Modal>
    </div>
  );
};

export default Posts;
