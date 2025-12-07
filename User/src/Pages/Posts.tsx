
import React, { useState, useRef, useCallback, memo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  User,
  Send,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { postRepo } from "../repositories/postRepo";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import PaginatedList, { PaginatedListRef } from "../components/PaginatedList";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const PostSkeleton = () => {
  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="space-y-0 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-9 w-9 sm:h-11 sm:w-11 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="-mx-4 sm:-mx-6 -mt-1">
          <Skeleton className="w-full h-48 sm:h-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2 w-full">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoized PostCard to prevent re-renders when parent state changes
const MemoizedPostCard = memo(PostCard);

// Separate Create Post Dialog component to isolate form state
const CreatePostDialog = memo(({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({ title: "", description: "", link: "" });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (image or video)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Please select an image or video file');
        return;
      }
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      await postRepo.createUserPost({
        ...formData,
        image: imageFile || undefined,
      });
      toast.success("Post created successfully");
      resetForm();
      onClose();
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Failed to create post");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isCreating}
              placeholder="Enter an engaging title..."
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              disabled={isCreating}
              placeholder="Share your thoughts, ideas, or updates..."
              className={`resize-none ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Image/Video Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Media <span className="text-muted-foreground">(Optional)</span>
            </Label>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border">
                {imageFile?.type.startsWith('video/') ? (
                  <video
                    src={imagePreview}
                    className="w-full h-48 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                  disabled={isCreating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload media
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images or Videos up to 50MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">
              Link <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              disabled={isCreating}
              placeholder="https://example.com"
              className={errors.link ? "border-destructive" : ""}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating} className="gap-2">
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CreatePostDialog.displayName = 'CreatePostDialog';

const Posts = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const listRef = useRef<PaginatedListRef<any>>(null);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePostCreated = useCallback(() => {
    listRef.current?.refresh?.();
  }, []);

  const handleDelete = useCallback(async (postId: string) => {
    try {
      await postRepo.deleteUserPost(postId);
      toast.success("Post deleted successfully");
      listRef.current?.removeItem(postId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  }, []);

  const handleEdit = useCallback(async (postId: string, updatedData: any) => {
    try {
      await postRepo.updateUserPost(postId, updatedData);
      toast.success("Post updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update post");
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

      {/* <UrlBreadcrumb /> */}
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="w-full space-y-1">

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="admin" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Badge variant="outline" className="h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 border-current text-[10px] sm:text-xs">A</Badge>
                <span className="hidden xs:inline">Admin </span>Announcements
              </TabsTrigger>
              <TabsTrigger value="user" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                User Posts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="default" className="gap-2 shadow-md w-full sm:w-auto sm:self-end">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Create Post
        </Button>
      </div>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Posts List */}
        {activeTab === "admin" && (
          <PaginatedList
            key="admin-posts"
            fetchData={async (page, limit) => {
              const res = await postRepo.getAllPosts(page, limit);
              return {
                items: res.posts || res.data || [],
                pagination: {
                  currentPage: res.pagination.currentPage,
                  totalPages: res.pagination.totalPages,
                  totalPosts: res.pagination.total,
                  hasMore: res.pagination.hasMore,
                  postsPerPage: res.pagination.limit
                }
              };
            }}
            renderItem={(post: any) => (
              <MemoizedPostCard
                key={post._id}
                postId={post._id}
                title={post.title}
                description={post.description}
                link={post.link}
                image={post.image}
                createdAt={post.createdAt}
                isAdmin
              />
            )}
            pageSize={10}
            loadingComponent={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            }
          />
        )}

        {activeTab === "user" && (
          <PaginatedList
            ref={listRef}
            key="user-posts"
            fetchData={async (page, limit) => {
              const res = await postRepo.getAllUsersPosts(page, limit);
              return {
                items: res.posts || res.data || [],
                pagination: {
                  currentPage: res.pagination.currentPage,
                  totalPages: res.pagination.totalPages,
                  totalPosts: res.pagination.total,
                  hasMore: res.pagination.hasMore,
                  postsPerPage: res.pagination.limit
                }
              };
            }}
            renderItem={(post: any) => (
              <MemoizedPostCard
                key={post._id}
                postId={post._id}
                title={post.title}
                description={post.description}
                link={post.link}
                image={post.image}
                createdAt={post.createdAt}
                authorName={post.user?.name}
                authorId={post.user?._id}
                authorAvatar={post.user?.avatar}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )}
            pageSize={10}
            loadingComponent={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            }
          />
        )}

        {/* Create Post Modal - Separate component to isolate form state */}
        <CreatePostDialog
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handlePostCreated}
        />
      </div>
    </div>
  );
};

export default Posts;