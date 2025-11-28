import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { message } from "antd";
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
    _id: string;
    name: string;
  };
}

const Posts = () => {
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");

  const [adminPage, setAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [adminHasMore, setAdminHasMore] = useState(true);
  const [userHasMore, setUserHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const POSTS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });

  const fetchPosts = async (page: number, type: "admin" | "user", append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response =
        type === "admin"
          ? await postRepo.getAllPosts(page, POSTS_PER_PAGE)
          : await postRepo.getAllUsersPosts(page, POSTS_PER_PAGE);

      const { posts, pagination } = response;

      if (type === "admin") {
        setAdminPosts((prev) => (append ? [...prev, ...posts] : posts));
        setAdminHasMore(pagination.hasMore);
      } else {
        setUserPosts((prev) => (append ? [...prev, ...posts] : posts));
        setUserHasMore(pagination.hasMore);
      }
    } catch (error) {
      message.error("Failed to fetch posts");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === "admin" && adminHasMore) {
            setAdminPage((prev) => prev + 1);
          } else if (activeTab === "user" && userHasMore) {
            setUserPage((prev) => prev + 1);
          }
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, activeTab, adminHasMore, userHasMore]
  );

  useEffect(() => {
    if (adminPage > 1) {
      fetchPosts(adminPage, "admin", true);
    }
  }, [adminPage]);

  useEffect(() => {
    if (userPage > 1) {
      fetchPosts(userPage, "user", true);
    }
  }, [userPage]);

  useEffect(() => {
    fetchPosts(1, "admin");
    fetchPosts(1, "user");
  }, []);

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

      if (response?.post) {
        setUserPosts((prev) => [response.post, ...prev]);
      } else {
        setUserPage(1);
        fetchPosts(1, "user");
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
      setIsCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postRepo.deleteUserPost(postId);
      message.success("Post deleted successfully");
      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEdit = async (postId: string, updatedData: Partial<Post>) => {
    try {
      await postRepo.updateUserPost(postId, updatedData);
      message.success("Post updated successfully");
      setUserPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, ...updatedData } : post))
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update post");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <UrlBreadcrumb />

      {/* TOP HEADER RESPONSIVE */}
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

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Create Post
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ADMIN POSTS */}
          {activeTab === "admin" && (
            <div className="space-y-6 flex flex-col items-center overflow-y-auto max-h-[75vh] w-full px-2">
              {adminPosts.length > 0 ? (
                <>
                  {adminPosts.map((post, index) => (
                    <div
                      key={post._id}
                      ref={index === adminPosts.length - 1 ? lastPostRef : null}
                      className="w-full max-w-2xl"
                    >
                      <FacebookPostCard
                        title={post.title}
                        description={post.description}
                        link={post.link}
                        createdAt={post.createdAt}
                        isAdmin={true}
                      />
                    </div>
                  ))}

                  {loadingMore && <Loader />}
                  {!adminHasMore && (
                    <p className="text-gray-500 text-sm">No more posts to load</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No admin posts found</p>
              )}
            </div>
          )}

          {/* USER POSTS */}
          {activeTab === "user" && (
            <div className="space-y-6 flex flex-col items-center overflow-y-auto max-h-[75vh] w-full px-2">
              {userPosts.length > 0 ? (
                <>
                  {userPosts.map((post, index) => (
                    <div
                      key={post._id}
                      ref={index === userPosts.length - 1 ? lastPostRef : null}
                      className="w-full max-w-2xl"
                    >
                      <FacebookPostCard
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
                    </div>
                  ))}

                  {loadingMore && <Loader />}
                  {!userHasMore && (
                    <p className="text-gray-500 text-sm">No more posts to load</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No user posts found</p>
              )}
            </div>
          )}
        </>
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
