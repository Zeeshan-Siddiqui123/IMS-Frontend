import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/UserAvatar';

export function NotificationsDropdown() {
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading
    } = useNotificationStore();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, fetchNotifications]);

    const handleNotificationClick = async (id: string, postId?: string) => {
        await markAsRead(id);
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="text-base font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs"
                            onClick={() => markAllAsRead()}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={cn(
                                        "relative flex items-start gap-3 p-4 border-b last:border-0 transition-colors hover:bg-muted/50",
                                        !notification.isRead && "bg-muted/20"
                                    )}
                                >
                                    <UserAvatar
                                        src={notification.sender.profilePicture}
                                        name={notification.sender.name}
                                        className="h-8 w-8 mt-1"
                                    />

                                    <div className="flex-1 space-y-1">
                                        <Link
                                            to={notification.data?.postId ? `/posts/${notification.data.postId}` : '#'}
                                            onClick={() => handleNotificationClick(notification._id, notification.data?.postId)}
                                            className="block"
                                        >
                                            <p className="text-sm cursor-pointer">
                                                <span className="font-semibold">{notification.sender.name}</span>
                                                {" "}{notification.message}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </Link>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-red-500 -mt-1 -mr-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>

                                    {!notification.isRead && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-4 border-t border-border">
                    <Link to="/notifications" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full text-xs h-8">
                            See all notifications
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
