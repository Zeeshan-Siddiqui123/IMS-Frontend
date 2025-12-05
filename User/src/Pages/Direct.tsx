
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"

export default function Direct() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <Card className="h-[70vh] flex items-center justify-center">
                <CardContent className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Send className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle>Direct Messages</CardTitle>
                        <p className="text-muted-foreground">
                            Direct messaging feature is coming soon!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
