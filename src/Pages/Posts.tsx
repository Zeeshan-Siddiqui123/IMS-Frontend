"use client"
import React, { useEffect, useState } from "react"
import { Modal, message, Spin } from "antd"
import { Button } from "@/components/ui/button"
import { MdDeleteSweep, MdEditSquare } from "react-icons/md"
import UrlBreadcrumb from "@/components/UrlBreadcrumb"
import { postRepo } from "@/repositories/postRepo"

interface Post {
  _id: string
  title: string
  description: string
  image: string
  link: string
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchPosts = async () => {
    try {
      const data = await postRepo.getAllPosts()
      setPosts(data || [])
    } catch (error) {
      message.error("Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", image: "", link: "" })
    setErrors({})
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await postRepo.updatePost(editingId, formData)
        message.success("Post updated successfully")
      } else {
        await postRepo.createPost(formData)
        message.success("Post created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchPosts()
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
      title: "Are you sure you want to delete this post?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await postRepo.deletePost(id)
          setPosts((prev) => prev.filter((p) => p._id !== id))
          message.success("Post deleted successfully")
        } catch {
          message.error("Failed to delete post")
        }
      },
    })
  }

  const openEditModal = (post: Post) => {
    setFormData({
      title: post.title,
      description: post.description,
      image: post.image,
      link: post.link,
    })
    setEditingId(post._id)
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="p-6">
      <UrlBreadcrumb />
      <div className="flex justify-between items-center mb-6 mt-5">
        <h2 className="text-2xl font-bold">Posts</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Post</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="border rounded-xl shadow-sm overflow-hidden bg-white dark:bg-neutral-900 flex flex-col"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 flex-1">
                  {post.description}
                </p>
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm mt-2 hover:underline"
                  >
                    Visit Link
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openEditModal(post)}
                  >
                    <MdEditSquare className="text-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post._id)}
                  >
                    <MdDeleteSweep className="text-white" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <span className="text-xl font-semibold mb-3 text-center block">
            {editingId ? "Edit Post" : "Create Post"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        footer={null}
        centered
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-7">
          {[
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "text" },
            { name: "image", label: "Image URL", type: "text" },
            { name: "link", label: "Link", type: "text" },
          ].map((input) => (
            <div key={input.name} className="relative z-0 w-full group">
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                value={(formData as any)[input.name]}
                onChange={handleChange}
                className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0
                  ${errors[input.name] ? "border-red-500" : "border-gray-300"}`}
                placeholder=" "
                autoComplete="off"
              />
              <label
                htmlFor={input.name}
                className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 
                  ${(formData as any)[input.name]
                    ? "-translate-y-6 scale-75 text-blue-600"
                    : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"}`}
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
        </div>

        <Button
          className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
          onClick={handleSave}
        >
          {editingId ? "Update Post" : "Create Post"}
        </Button>
      </Modal>
    </div>
  )
}

export default Posts
