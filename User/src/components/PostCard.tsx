import React, { useState } from "react";
import {
  FaThumbsUp,
  FaRegCommentDots,
  FaShare,
  FaEllipsisV,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/store/authStore";

interface PostCardProps {
  postId?: string;
  title: string;
  description: string;
  link?: string;
  createdAt: string;
  authorName?: string;
  authorId?: string; // owner ID
  isAdmin?: boolean;

  onDelete?: (postId: string) => void;
  onEdit?: (
    postId: string,
    data: { title: string; description: string; link: string }
  ) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  postId,
  title,
  description,
  link,
  createdAt,
  authorName,
  authorId = "", // FIX: default empty string → avoids undefined error
  isAdmin = false,
  onDelete,
  onEdit,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title,
    description,
    link: link || "",
  });

  const { user, isAuthenticated } = useAuthStore();

  // FIX: ensure user exists before comparison
  const isOwner = isAuthenticated && user?._id && user?._id === authorId;

  // time ago
  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000
    );
    const intervals: any = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (let key in intervals) {
      const diff = Math.floor(seconds / intervals[key]);
      if (diff >= 1) return `${diff} ${key}${diff > 1 ? "s" : ""} ago`;
    }

    return "Just now";
  };

  const circleContent = isAdmin
    ? "A"
    : authorName
    ? authorName[0].toUpperCase()
    : "?";

  const displayName = isAdmin ? "Admin" : authorName || "User";

  const handleDelete = () => {
    if (postId && onDelete) onDelete(postId);
    setIsDeleteDialogOpen(false);
  };

  const handleEditSubmit = () => {
    if (postId && onEdit) {
      onEdit(postId, editForm);
      setIsEditModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md w-full max-w-xl mx-auto border border-gray-200 dark:border-neutral-800 relative">

        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 relative">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center text-white font-semibold">
            {circleContent}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {displayName}
            </p>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(createdAt)}
            </span>
          </div>

          {/* Only Owner Can See Edit/Delete */}
          {isOwner && postId && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
              >
                <FaEllipsisV className="text-gray-600 dark:text-gray-300" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-20">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-left"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 text-left"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TITLE */}
        <p className="px-4 pb-1 font-semibold text-gray-900 dark:text-white">
          {title}
        </p>

        {/* DESCRIPTION */}
        <p className="px-4 pb-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>

        {/* LINK */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 text-blue-600 text-sm font-medium underline"
          >
            Visit Link
          </a>
        )}

        <div className="my-3 h-[1px] bg-gray-200 dark:bg-neutral-700" />

        {/* ACTION BUTTONS */}
        <div className="flex justify-around py-2 text-gray-600 dark:text-gray-300">
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 px-5 py-2 rounded-md">
            <FaThumbsUp /> Like
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 px-5 py-2 rounded-md">
            <FaRegCommentDots /> Comment
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 px-5 py-2 rounded-md">
            <FaShare /> Share
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Link</Label>
              <Input
                value={editForm.link}
                onChange={(e) =>
                  setEditForm({ ...editForm, link: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostCard;
