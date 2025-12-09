import { useUserLogs } from "../lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";

interface GlobalActivityFeedProps {
    userId: string | null;
}

export default function GlobalActivityFeed({ userId }: GlobalActivityFeedProps) {
    const { data: logs, isLoading } = useUserLogs(userId || "");

    if (!userId) {
        return <div className="text-center text-muted-foreground p-4">Please connect wallet to view activity.</div>;
    }

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "ANALYSIS": return "🔍";
            case "DECISION": return "💡";
            case "TRADE": return "⚡";
            case "RISK_BLOCK": return "🛡️";
            case "ERROR": return "❌";
            default: return "📝";
        }
    }

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "TRADE": return "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50";
            case "RISK_BLOCK": return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/50";
            case "ERROR": return "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50";
            case "DECISION": return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/50";
            default: return "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 border-slate-500/50";
        }
    }

    return (
        <ScrollArea className="h-[400px] w-full rounded-md bg-panel p-4">
            <div className="space-y-4">
                {logs?.map((log: any) => {
                    const cleanMessage = log.message.replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u, "");
                    const time = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    return (
                        <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-hover transition-colors border border-transparent hover:border-border/50 group">
                            {/* Icon Column */}
                            <div className="shrink-0 mt-1">
                                <span className="text-xl filter drop-shadow-md">{getIcon(log.type)}</span>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`${getBadgeStyle(log.type)} transition-all duration-300`}>
                                            {log.type}
                                        </Badge>
                                        {/* Agent Name Badge */}
                                        <Badge variant="secondary" className="bg-surface text-text-secondary border-border">
                                            🤖 {log.agent?.name || "Unknown Agent"}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-text-secondary font-mono opacity-70 group-hover:opacity-100 transition-opacity">
                                        {time}
                                    </span>
                                </div>
                                <p className="text-sm text-text-primary leading-relaxed">
                                    {cleanMessage}
                                </p>
                            </div>
                        </div>
                    )
                })}
                {!logs?.length && (
                    <div className="text-center text-text-secondary py-10 flex flex-col items-center gap-2">
                        <span className="text-4xl opacity-20">💤</span>
                        <p>No activity recorded yet.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
