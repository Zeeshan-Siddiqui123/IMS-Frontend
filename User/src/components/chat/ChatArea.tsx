import { useRef, useEffect } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Hash, Phone, Video, PlusCircle, Gift, Sticker, Smile, SendHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/hooks/store/authStore";

interface ChatAreaProps {
    activeUserId?: string;
    userName?: string;
    userAvatar?: string; // Add this to allow passing the other user's avatar
}

// Mock messages
const MOCK_MESSAGES = [
    { id: 1, senderId: "2", text: "Hey! Did you check the new update?", timestamp: "2024-04-20T10:00:00" },
    { id: 2, senderId: "me", text: "Yeah, it looks amazing! especially the new dark mode.", timestamp: "2024-04-20T10:05:00" },
    { id: 3, senderId: "2", text: "Right? I love the contrast.", timestamp: "2024-04-20T10:06:00" },
    { id: 4, senderId: "2", text: "Are you free to call later?", timestamp: "2024-04-20T10:06:30" },
    { id: 5, senderId: "me", text: "Sure, maybe around 5pm?", timestamp: "2024-04-20T10:10:00" },
    { id: 6, senderId: "2", text: "Perfect. See ya.", timestamp: "2024-04-20T10:11:00" },
    { id: 7, senderId: "me", text: "Bye!", timestamp: "2024-04-20T10:12:00" },
    { id: 8, senderId: "2", text: "One more thing...", timestamp: "2024-04-20T10:15:00" },
    { id: 9, senderId: "2", text: "How do I implement the vertex shader?", timestamp: "2024-04-20T10:15:15" },
];

export function ChatArea({ activeUserId, userName = "Select a User", userAvatar }: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeUserId]);

    if (!activeUserId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-background">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <Hash className="w-12 h-12 opacity-50" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No conversation selected</h2>
                <p>Choose a friend from the sidebar to start chatting.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 h-full bg-background relative min-h-0">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4 shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                    <UserAvatar src={userAvatar} name={userName} className="h-8 w-8" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-none flex items-center gap-1.5">
                            {userName}
                            {/* <span className="bg-green-500 w-2 h-2 rounded-full inline-block" /> */}
                        </span>
                        {/* <span className="text-xs text-muted-foreground">Online</span> */}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <Phone className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    <Video className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    {/* <HelpCircle className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" /> */}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
                <div className="flex flex-col gap-4 pb-4">
                    {/* Welcome message mock */}
                    <div className="mt-8 mb-8 px-4">
                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <UserAvatar src={userAvatar} name={userName} className="h-16 w-16" />
                        </div>
                        <h1 className="text-3xl font-bold mb-1">This is the beginning of your direct message history with <span className="text-primary">{userName}</span></h1>
                        <p className="text-muted-foreground">This is the beginning of your direct message history with {userName}. Say hello!</p>
                    </div>

                    <Separator className="mb-4" />

                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 group ${msg.senderId === 'me' ? 'flex-row-reverse' : ''}`}>
                            {msg.senderId !== 'me' ? (
                                <UserAvatar src={userAvatar} name={userName} className="h-10 w-10 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity" />
                            ) : (
                                <UserAvatar src={user?.avatar} name={user?.name} className="h-10 w-10 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity" />
                            )}

                            <div className={`max-w-[70%] flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    {msg.senderId !== 'me' && <span className="font-semibold text-sm hover:underline cursor-pointer">{userName}</span>}
                                    <span className="text-[10px] text-muted-foreground select-none">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                            ${msg.senderId === 'me'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-secondary/50 hover:bg-secondary/60 transition-colors rounded-tl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="pt-0">
                <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-3">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground shrink-0">
                        <PlusCircle className="w-5 h-5" />
                    </Button>

                    <div className="flex-1">
                        <Input
                            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-2 text-base placeholder:text-muted-foreground/70"
                            placeholder={`Message @${userName}`}
                        />
                    </div>

                    <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary/80 shrink-0">
                        <SendHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
