import { useAgentLogs } from "../lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Log {
    id: string;
    type: "ANALYSIS" | "DECISION" | "TRADE" | "RISK_BLOCK" | "ERROR";
    message: string;
    metadata?: any;
    createdAt: string;
}

export default function AgentActivityFeed({ agentId }: { agentId: string }) {
    const { data: logs, isLoading } = useAgentLogs(agentId);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const getLogStyle = (type: string) => {
        switch (type) {
            case "ANALYSIS": return "bg-blue-500/10 border-blue-500/20 text-blue-200";
            case "DECISION": return "bg-gray-500/10 border-gray-500/20 text-gray-200";
            case "TRADE": return "bg-green-500/10 border-green-500/20 text-green-200";
            case "RISK_BLOCK": return "bg-red-500/10 border-red-500/20 text-red-200";
            case "ERROR": return "bg-red-900/10 border-red-900/20 text-red-400";
            default: return "bg-gray-800 border-gray-700 text-gray-300";
        }
    };

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "ANALYSIS": return "bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20";
            case "DECISION": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20";
            case "TRADE": return "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20";
            case "RISK_BLOCK": return "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20";
            case "ERROR": return "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/30";
            default: return "bg-gray-800 text-gray-400 border-gray-700";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "ANALYSIS": return "🔍";
            case "DECISION": return "💡";
            case "TRADE": return "✅";
            case "RISK_BLOCK": return "🚫";
            case "ERROR": return "⚠️";
            default: return "📝";
        }
    };

    if (isLoading) return <div className="text-xs text-gray-500">Loading activity...</div>;
    if (!logs?.length) return <div className="text-xs text-gray-500">No activity recorded yet.</div>;

    return (
        <ScrollArea className="h-[300px] w-full rounded-md border border-gray-800 p-4 bg-black/20">
            <div className="space-y-3">
                {logs.map((log: Log) => {
                    // Strip leading emojis to prevent double rendering (Legacy fix)
                    const cleanMessage = log.message.replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u, "");

                    return (
                        <div
                            key={log.id}
                            className={`p-3 rounded-lg border text-sm ${getLogStyle(log.type)} transition-all cursor-pointer hover:opacity-90`}
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-[10px] opacity-60">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${getBadgeStyle(log.type)}`}>
                                    {log.type}
                                </Badge>
                            </div>

                            <div className="flex gap-2 items-start">
                                <span>{getIcon(log.type)}</span>
                                <p className="leading-snug">{cleanMessage}</p>
                            </div>

                            {expandedLog === log.id && log.metadata && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <pre className="text-[10px] font-mono bg-black/40 p-2 rounded overflow-x-auto text-gray-400">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
