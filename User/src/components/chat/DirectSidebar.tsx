import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { Search, Megaphone, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface DirectSidebarProps {
    className?: string;
    activeUserId?: string;
    onUserSelect: (userId: string) => void;
}

// Mock data
const MOCK_GROUPS = [
    { id: "g1", name: "Project Alpha", icon: "ALPHA" },
    { id: "g2", name: "Design Team", icon: "DSGN" },
    { id: "g3", name: "Frontend Devs", icon: "DEV" },
];

const MOCK_USERS = [
    { id: "1", name: "Alice Smith", avatar: "", status: "online", lastMessage: "Hey, how are you?" },
    { id: "2", name: "Bob Jones", avatar: "", status: "idle", lastMessage: "Did you see the new post?" },
    { id: "3", name: "Charlie Day", avatar: "", status: "dnd", lastMessage: "Busy right now." },
    { id: "4", name: "David Miller", avatar: "", status: "offline", lastMessage: "See you later!" },
    { id: "5", name: "Eve Wilson", avatar: "", status: "online", lastMessage: "Great idea!" },
    { id: "6", name: "Frank Thomas", avatar: "", status: "offline", lastMessage: "ok" },
    { id: "7", name: "Grace Lee", avatar: "", status: "online", lastMessage: "Thanks!" },
];

export function DirectSidebar({ className, activeUserId, onUserSelect }: DirectSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full min-h-0 overflow-hidden bg-secondary/30 border-r", className)}>
            <div className="pt-12 md:pt-4 px-4 pb-4 border-b space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Find or start a conversation" className="pl-8 bg-background/50 h-9" />
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-2 space-y-4">

                    {/* Announcements Section */}
                    <div>
                        <div className="px-2 pb-1 mt-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                            Official
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onUserSelect('announcements')}
                            className={cn(
                                "w-full justify-start px-2 py-6 rounded-md transition-colors group relative",
                                activeUserId === 'announcements'
                                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-3">
                                <Megaphone className="h-4 w-4" />
                            </div>
                            <div className="font-medium text-sm">Announcements</div>
                        </Button>
                    </div>

                    {/* Collaborations Section (Groups) */}
                    <div>
                        <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex justify-between items-center group cursor-pointer">
                            Collaborations
                            {/* <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" /> */}
                        </div>
                        <div className="space-y-0.5">
                            {MOCK_GROUPS.map((group) => (
                                <Button
                                    key={group.id}
                                    variant="ghost"
                                    onClick={() => onUserSelect(group.id)}
                                    className={cn(
                                        "w-full justify-start px-2 py-6 rounded-md transition-colors",
                                        activeUserId === group.id
                                            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold mr-3">
                                        <Hash className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 text-left truncate font-medium text-sm">
                                        {group.name}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator className="mx-2 bg-border/50 w-auto" />

                    {/* Direct Messages Section */}
                    <div>
                        <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                            Direct Messages
                        </div>
                        <div className="space-y-0.5">
                            {MOCK_USERS.map((user) => (
                                <Button
                                    key={user.id}
                                    variant="ghost"
                                    onClick={() => onUserSelect(user.id)}
                                    className={cn(
                                        "w-full justify-start items-center px-2 py-6 rounded-md transition-colors group relative",
                                        activeUserId === user.id
                                            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="relative shrink-0 mr-3">
                                        <UserAvatar src={user.avatar} name={user.name} className="h-8 w-8 md:h-9 md:w-9" />
                                        <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                            user.status === 'online' ? "bg-green-500" :
                                                user.status === 'idle' ? "bg-yellow-500" :
                                                    user.status === 'dnd' ? "bg-red-500" : "bg-gray-500"
                                        )} />
                                    </div>

                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                        <div className="text-xs truncate opacity-70 font-normal">
                                            {user.lastMessage}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="p-2 bg-background/40 flex items-center gap-2 border-t text-xs text-muted-foreground justify-center">
                <span className="truncate">Connected</span>
            </div>
        </div>
    );
}
