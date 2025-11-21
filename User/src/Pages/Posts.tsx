import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { Button } from "@/components/ui/button";
import { postRepo } from "../repositories/postRepo";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import Loader from "@/components/Loader";
import FacebookPostCard from "../components/FacebookPostCard";

interface Post {
  _id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

const Posts = () => {
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // ✅ Loading state for create
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });

  // Fetch Posts
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
    
    // ✅ Clear error jab user type kare
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true); // ✅ Loading start
      
      const form = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
      };

      const response = await postRepo.createUserPost(form);
      message.success("Post created successfully");
      
      // ✅ Backend se populated post aa raha hai to directly add karo
      if (response?.post) {
        setUserPosts((prev) => [response.post, ...prev]);
      } else {
        // ✅ Agar response mein post nahi hai to refetch karo
        await fetchPosts();
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.message || "Failed to create post");
      }
    } finally {
      setIsCreating(false); // ✅ Loading end
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-6">
      <UrlBreadcrumb />
      <div className="text-2xl font-bold mb-6">User Dashboard</div>

      {/* Tabs */}
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
          {/* Admin Posts */}
          {activeTab === "admin" && (
            <div className="space-y-6 flex flex-col items-center overflow-y-auto max-h-[70vh]">
              {adminPosts.length > 0 ? (
                adminPosts.map((post) => (
                  <FacebookPostCard
                    key={post._id}
                    title={post.title}
                    description={post.description}
                    link={post.link}
                    createdAt={post.createdAt}
                    isAdmin={true}
                  />
                ))
              ) : (
                <p className="text-gray-500">No admin posts found</p>
              )}
            </div>
          )}

          {/* User Posts */}
          {activeTab === "user" && (
            <div className="space-y-6 flex flex-col items-center overflow-y-auto max-h-[70vh]">
              <div className="flex justify-between w-full mb-4 px-4">
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
                userPosts.map((post) => (
                  <FacebookPostCard
                    key={post._id}
                    title={post.title}
                    description={post.description}
                    link={post.link}
                    createdAt={post.createdAt}
                    authorName={post.user?.name}
                  />
                ))
              ) : (
                <p className="text-gray-500">No user posts found</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
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
        closable={!isCreating} 
        maskClosable={!isCreating}
      >
        <div className="grid grid-cols-1 gap-6 mb-6 mt-7">
          {[
            { name: "title", label: "Title", type: "text" },
            { name: "link", label: "Link", type: "text" },
          ].map((input) => (
            <div key={input.name} className="relative z-0 w-full group">
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                disabled={isCreating} // ✅ Creating ke time disable
                className={`peer block w-full border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-black focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
              )}
            </div>
          ))}

          {/* Description */}
          <div className="relative z-0 w-full group">
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={isCreating} // ✅ Creating ke time disable
              className={`peer block w-full border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-black focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed ${
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
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        <Button
          className="w-full h-11 text-lg font-medium bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreate}
          disabled={isCreating} // ✅ Loading ke time disable
        >
          {isCreating ? "Creating..." : "Create Post"} {/* ✅ Dynamic text */}
        </Button>
      </Modal>
    </div>
  );
};

export default Posts;