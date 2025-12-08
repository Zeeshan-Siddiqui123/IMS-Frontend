import { useState } from "react";
import { DirectSidebar } from "@/components/chat/DirectSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { AnnouncementView } from "@/components/chat/AnnouncementView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Direct() {
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const isMobile = useIsMobile();

    // Mock lookup
    const getName = (id?: string) => {
        if (!id) return undefined;
        if (id === 'announcements') return "Announcements";

        const groups: Record<string, string> = {
            "g1": "Project Alpha",
            "g2": "Design Team",
            "g3": "Frontend Devs",
        };
        if (groups[id]) return groups[id];

        const users: Record<string, string> = {
            "1": "Alice Smith",
            "2": "Bob Jones",
            "3": "Charlie Day",
            "4": "David Miller",
            "5": "Eve Wilson",
            "6": "Frank Thomas",
            "7": "Grace Lee",
        };
        return users[id] || "User";
    };

    const renderContent = () => {
        if (activeId === 'announcements') {
            return <AnnouncementView />;
        }
        return <ChatArea activeUserId={activeId} userName={getName(activeId)} />;
    };

    return (
        <div className="flex flex-1 bg-background overflow-hidden h-full min-h-0">
            {/* Sidebar - Hidden on mobile, Sheet on mobile */}
            {isMobile ? (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-[4.5rem] left-4 z-50 md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <DirectSidebar
                            activeUserId={activeId}
                            onUserSelect={(id) => setActiveId(id)}
                            className="bg-background border-r-0"
                        />
                    </SheetContent>
                </Sheet>
            ) : (
                <DirectSidebar
                    className="w-80 shrink-0 hidden md:flex"
                    activeUserId={activeId}
                    onUserSelect={(id) => setActiveId(id)}
                />
            )}

            {/* Content Area */}
            {renderContent()}
        </div>
    );
}
