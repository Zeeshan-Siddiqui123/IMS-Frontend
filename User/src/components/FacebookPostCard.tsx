import React from "react";
import { FaThumbsUp, FaRegCommentDots, FaShare } from "react-icons/fa";

interface PostCardProps {
    title: string;
    description: string;
    link?: string;
    createdAt: string;
    authorName?: string; // NEW
    isAdmin?: boolean;   // NEW
}

const FacebookPostCard: React.FC<PostCardProps> = ({
    title,
    description,
    link,
    createdAt,
    authorName,
    isAdmin = false,
}) => {

    const formatTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);

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
            if (diff >= 1) {
                return `${diff} ${key}${diff > 1 ? "s" : ""} ago`;
            }
        }

        return "Just now";
    };

    // Circle content
    const circleContent = isAdmin ? "A" : authorName ? authorName[0].toUpperCase() : "?";
    const displayName = isAdmin ? "Admin" : authorName || "User";

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md w-full max-w-xl mx-auto mb-6 border border-gray-200 dark:border-neutral-800">

            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center text-white font-semibold">
                    {circleContent}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
                    <span className="text-xs text-gray-500">
                        {formatTimeAgo(createdAt)}
                    </span>
                </div>
            </div>

            {/* Title */}
            <p className="px-4 pb-1 font-semibold text-gray-900 dark:text-white">{title}</p>

            {/* Description */}
            <p className="px-4 pb-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {description}
            </p>

            {/* Optional Link */}
            {link && (
                <a
                    href={link}
                    target="_blank"
                    className="px-4 text-blue-600 text-sm font-medium underline"
                >
                    Visit Link
                </a>
            )}

            {/* Divider */}
            <div className="my-3 h-[1px] bg-gray-200 dark:bg-neutral-700" />

            {/* Like / Comment / Share */}
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
    );
};

export default FacebookPostCard;
