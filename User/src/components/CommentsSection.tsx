import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  User,
  Send,
  Loader2,
} from "lucide-react";
import { commentRepo } from "@/repositories/commentRepo";
import { useAuthStore } from "@/hooks/store/authStore";

export const CommentsSection = ({ postId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editId, setEditId] = useState("");

  const observer = useRef(null);
  const limit = 10;

  const loadComments = useCallback(async (pageNum = 1, append = false) => {
    try {
      append ? setIsLoadingMore(true) : setIsLoading(true);
      
      const res = await commentRepo.getCommentsByPost(postId, pageNum, limit);
      
      if (append) {
        setComments(prev => [...prev, ...(res?.data ?? [])]);
      } else {
        setComments(res?.data ?? []);
      }
      
      setHasMore(res?.pagination?.hasMore ?? false);
      setCommentCount(res?.pagination?.total ?? 0);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const lastCommentRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => {
            const nextPage = prev + 1;
            loadComments(nextPage, true);
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadComments]
  );

  const handleAddComment = async () => {
    if (!content.trim()) return;
    await commentRepo.createComment(postId, content);
    setContent("");
    setPage(1);
    loadComments(1);
  };

  const openEditModal = (comment) => {
    setEditId(comment._id);
    setEditValue(comment.content);
    setIsEditModal(true);
  };

  const handleUpdateComment = async () => {
    await commentRepo.updateComment(editId, editValue);
    setIsEditModal(false);
    setPage(1);
    loadComments(1);
  };

  const deleteComment = async (id) => {
    await commentRepo.deleteComment(id);
    setPage(1);
    loadComments(1);
  };

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Comment Count */}
      {commentCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>
      )}

      {/* Add Comment Input */}
      <div className="flex gap-3 items-start">
        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey && content.trim()) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="min-h-[80px] resize-none focus-visible:ring-1"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!content.trim()}
              onClick={handleAddComment}
              className="gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments List with Custom Scroll */}
      <div className="max-h-[600px] overflow-y-auto border rounded-md">
        <div className="space-y-3 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <>
              {comments.map((c, index) => {
                const isLast = index === comments.length - 1;
                return (
                  <div 
                    key={c._id} 
                    ref={isLast ? lastCommentRef : null}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                        <AvatarFallback>
                          {c.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{c.user?.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(c.createdAt)}</span>
                            </div>
                          </div>

                          {user?._id === c.user?._id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => openEditModal(c)}>
                                  <Edit className="mr-2 h-3.5 w-3.5" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteComment(c._id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <p className="text-sm leading-relaxed text-foreground/90">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* No more comments */}
              {!hasMore && comments.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No more comments to load
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Comment Modal */}
      <Dialog open={isEditModal} onOpenChange={setIsEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={4}
              placeholder="Edit your comment..."
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateComment}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};