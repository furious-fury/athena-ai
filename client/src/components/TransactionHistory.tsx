import { ArrowUpRight, ArrowDownLeft, Ghost, RefreshCw } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrades, useUserActivity, useSyncDeposits } from "../lib/api";
import { toast } from "sonner";

interface TransactionHistoryProps {
    userId: string | null;
    className?: string;
}

export default function TransactionHistory({ userId, className }: TransactionHistoryProps) {
    const { data: trades, isLoading: tradesLoading, refetch: refetchTrades } = useTrades(userId || "");
    const { data: activities, isLoading: activityLoading, refetch: refetchActivity } = useUserActivity(userId || "");
    const syncDeposits = useSyncDeposits();

    const handleRefresh = async () => {
        if (!userId) return;
        try {
            const data = await syncDeposits.mutateAsync(userId);
            if (data.newDeposits > 0) {
                if (data.newDeposits === 1 && data.newDepositHashes?.[0]) {
                    toast.success("Sync Complete: Found 1 new deposit!", {
                        description: (
                            <a href={`https://polygonscan.com/tx/${data.newDepositHashes[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                View on Explorer <ArrowUpRight size={12} />
                            </a>
                        ),
                        duration: 8000
                    });
                } else {
                    toast.success(`Sync Complete: Found ${data.newDeposits} new deposits!`);
                }
            } else {
                toast.info("Sync Complete: No new deposits found.");
            }
            refetchTrades();
            refetchActivity();
        } catch (e) {
            console.error("Failed to sync deposits", e);
            toast.error("Failed to sync deposits");
        }
    };

    const isLoading = tradesLoading || activityLoading;

    // improved type safety could be added here
    const allEvents = [
        ...(trades || []).map((t: any) => ({ ...t, eventType: 'TRADE' })),
        ...(activities || []).map((a: any) => ({
            ...a,
            eventType: a.type, // 'DEPOSIT' or 'WITHDRAWAL'
            outcome: a.type,   // For display
            side: a.type === 'DEPOSIT' ? 'IN' : 'OUT'
        }))
    ].sort((a, b) => {
        const tA = new Date(a.timestamp || a.createdAt).getTime();
        const tB = new Date(b.timestamp || b.createdAt).getTime();
        return tB - tA;
    });

    const isEmpty = !isLoading && allEvents.length === 0;

    return (
        <Card className={`bg-panel border-transparent p-6 flex flex-col ${className || 'h-[400px]'}`}>
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    onClick={handleRefresh}
                    disabled={syncDeposits.isPending}
                >
                    <RefreshCw size={16} className={syncDeposits.isPending ? "animate-spin" : ""} />
                </Button>
            </div>

            {isLoading && (
                <div className="flex-1 flex items-center justify-center text-text-secondary">
                    Loading history...
                </div>
            )}

            {isEmpty && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 overflow-hidden">
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                        <Ghost size={32} className="text-gray-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">No recent activity</h4>
                        <p className="text-sm text-text-secondary max-w-xs mx-auto mt-1">
                            Your recent transactions and trades will appear here.
                        </p>
                    </div>
                </div>
            )}

            {!isLoading && !isEmpty && (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {allEvents.map((tx: any, index: number) => (
                        <div key={tx.id || `tx-${index}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.eventType === 'TRADE'
                                    ? (tx.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')
                                    : (tx.eventType === 'DEPOSIT' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400')
                                    }`}>
                                    {tx.eventType === 'TRADE' && tx.side === 'BUY' && <ArrowDownLeft size={18} />}
                                    {tx.eventType === 'TRADE' && tx.side === 'SELL' && <ArrowUpRight size={18} />}
                                    {tx.eventType === 'DEPOSIT' && <ArrowDownLeft size={18} />}
                                    {tx.eventType === 'WITHDRAWAL' && <ArrowUpRight size={18} />}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">
                                        {tx.eventType === 'TRADE' ? `${tx.side} ${tx.outcome}` : tx.eventType}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {new Date(tx.timestamp || tx.createdAt || new Date().toISOString()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`font-mono text-sm font-bold ${(tx.side === 'SELL' || tx.eventType === 'DEPOSIT') ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                    {(tx.side === 'SELL' || tx.eventType === 'DEPOSIT') ? '+' : '-'}${tx.amount?.toFixed(2)}
                                </p>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                    {tx.status || "Completed"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
