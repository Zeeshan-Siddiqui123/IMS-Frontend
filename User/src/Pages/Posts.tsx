import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { message } from "antd";
import { postRepo } from "../repositories/postRepo";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import PostCard from "../components/PostCard";
import PaginatedList from "../components/PaginatedList";

interface Post {
  _id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
  };
}

const Posts = () => {
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", link: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ title: "", description: "", link: "" });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      setIsCreating(true);
      const response = await postRepo.createUserPost(formData);
      message.success("Post created successfully");
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.message || "Failed to create post");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postRepo.deleteUserPost(postId);
      message.success("Post deleted successfully");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEdit = async (postId: string, updatedData: Partial<Post>) => {
    try {
      await postRepo.updateUserPost(postId, updatedData);
      message.success("Post updated successfully");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update post");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <UrlBreadcrumb />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "admin" | "user")}
        >
          <TabsList className="flex w-full sm:w-auto">
            <TabsTrigger value="admin">Admin Announcements</TabsTrigger>
            <TabsTrigger value="user">User Posts</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          Create Post
        </Button>
      </div>

      {activeTab === "admin" && (
        <PaginatedList<Post>
          key="admin-posts"
          fetchData={async (page, limit) => {
            const res = await postRepo.getAllPosts(page, limit);
            // Map backend response to expected format
            return {
              items: res.posts || res.data || [], // Handle both formats
              pagination: {
                currentPage: res.pagination.currentPage,
                totalPages: res.pagination.totalPages,
                totalPosts: res.pagination.total,
                hasMore: res.pagination.hasMore,
                postsPerPage: res.pagination.limit
              }
            };
          }}
          renderItem={(post) => (
            <PostCard
              title={post.title}
              description={post.description}
              link={post.link}
              createdAt={post.createdAt}
              isAdmin
            />
          )}
          pageSize={10}
        />
      )}

      {activeTab === "user" && (
        <PaginatedList<Post>
          key="user-posts"
          fetchData={async (page, limit) => {
            const res = await postRepo.getAllUsersPosts(page, limit);
            // Map backend response to expected format
            return {
              items: res.posts || res.data || [], // Handle both formats
              pagination: {
                currentPage: res.pagination.currentPage,
                totalPages: res.pagination.totalPages,
                totalPosts: res.pagination.total,
                hasMore: res.pagination.hasMore,
                postsPerPage: res.pagination.limit
              }
            };
          }}
          renderItem={(post) => (
            <PostCard
              postId={post._id}
              title={post.title}
              description={post.description}
              link={post.link}
              createdAt={post.createdAt}
              authorName={post.user?.name}
              authorId={post.user?._id}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          pageSize={10}
        />
      )}

      {/* CREATE POST MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isCreating}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={isCreating}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                name="link"
                value={formData.link}
                onChange={handleChange}
                disabled={isCreating}
                className={errors.link ? "border-red-500" : ""}
              />
              {errors.link && <p className="text-red-500 text-xs">{errors.link}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>

            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Posts;