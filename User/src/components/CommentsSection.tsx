import React, { useEffect, useState } from "react";
import { commentRepo } from "@/repositories/commentRepo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/hooks/store/authStore";

interface Props {
    postId: string;
}

const CommentsSection: React.FC<Props> = ({ postId }) => {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [content, setContent] = useState("");

    const [isEditModal, setIsEditModal] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [editId, setEditId] = useState("");

    const loadComments = async () => {
        const res = await commentRepo.getCommentsByPost(postId, page, 10);

        // SAFE fallback
        setComments(res?.docs ?? []);
        setTotalPages(res?.totalPages ?? 1);
    };

    useEffect(() => {
        loadComments();
    }, [page]);

    const handleAddComment = async () => {
        if (!content.trim()) return;

        await commentRepo.createComment(postId, content);
        setContent("");
        loadComments();
    };

    const openEditModal = (comment: any) => {
        setEditId(comment._id);
        setEditValue(comment.content);
        setIsEditModal(true);
    };

    const handleUpdateComment = async () => {
        await commentRepo.updateComment(editId, editValue);
        setIsEditModal(false);
        loadComments();
    };

    const deleteComment = async (id: string) => {
        await commentRepo.deleteComment(id);
        loadComments();
    };

    return (
        <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">

            {/* Add Comment */}
            <div className="flex gap-2 mb-3">
                <Input
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <Button onClick={handleAddComment}>Post</Button>
            </div>

            {/* Comments List */}
            {comments.map((c) => (
                <div
                    key={c._id}
                    className="border-b pb-2 mb-2 border-gray-300 dark:border-neutral-700"
                >
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {c.user?.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{c.content}</p>

                    {user?._id === c.user?._id && (
                        <div className="flex gap-3 mt-1 text-sm">
                            <button
                                onClick={() => openEditModal(c)}
                                className="text-blue-600 flex items-center gap-1"
                            >
                                <FaEdit /> Edit
                            </button>

                            <button
                                onClick={() => deleteComment(c._id)}
                                className="text-red-600 flex items-center gap-1"
                            >
                                <FaTrash /> Delete
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-between mt-3">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </Button>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModal} onOpenChange={setIsEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Comment</DialogTitle>
                    </DialogHeader>

                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                    />

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

export default CommentsSection;
