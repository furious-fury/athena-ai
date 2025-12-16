import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Ghost, History, Activity } from "lucide-react";
import { useUserPositions, useTrades, useUserBalance, usePortfolioHistory, useClosePosition } from "../lib/api";
import TradeHistory from "./TradeHistory";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PnLCard } from "./PnLCard";

interface ActivePositionsProps {
    userId: string | null;
    className?: string;
}

export default function ActivePositions({ userId, className }: ActivePositionsProps) {
    const [tab, setTab] = useState<"positions" | "history">("positions");

    // Hooks
    const { data: positions, isLoading } = useUserPositions(userId || "");
    useTrades(userId || "");
    useUserBalance(userId || "");
    usePortfolioHistory(userId || "");

    const [closingId, setClosingId] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isEmpty = !isLoading && (!positions || positions.length === 0);

    const closePositionMutation = useClosePosition();

    const handleClosePosition = async () => {
        if (!userId || !selectedPosition) return;

        const { marketId, outcome } = selectedPosition;
        setClosingId(marketId);
        setIsDialogOpen(false); // Close dialog immediately

        try {
            await closePositionMutation.mutateAsync({
                userId,
                marketId,
                outcome
            });

            toast.success(`Successfully sold ${outcome} position!`);

            // Refetch is handled by mutation onSuccess (invalidating queries)
            // But we can keep explicit refetch here if we want double assurance, 
            // though invalidateQueries is cleaner.
            // Let's rely on invalidateQueries in the hook.

        } catch (e: any) {
            toast.error("Failed to close position: " + e.message);
        } finally {
            setClosingId(null);
            setSelectedPosition(null);
        }
    };

    const confirmClose = (pos: any) => {
        setSelectedPosition(pos);
        setIsDialogOpen(true);
    };

    return (
        <Card className={`bg-panel border-transparent p-6 overflow-hidden flex flex-col ${className || 'h-[400px]'}`}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#1c1f26] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Sale</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to CLOSE your <span className="text-white font-bold">{selectedPosition?.outcome}</span> position on market <span className="text-white font-bold">{selectedPosition?.marketTitle || selectedPosition?.marketId}</span>?
                            <br /><br />
                            This will sell all shares immediately at the best available market price.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 hover:text-white text-text-secondary">Cancel</Button>
                        <Button onClick={handleClosePosition} className="bg-red-500 hover:bg-red-600 text-white border-0">
                            Confirm Sell
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-white">Portfolio Activity</h3>
                    <p className="text-text-secondary text-sm">Manage predictions and view history.</p>
                </div>
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <button
                        onClick={() => setTab("positions")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${tab === "positions"
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-text-secondary hover:text-white"
                            }`}
                    >
                        <Activity className="w-3 h-3" />
                        Active Positions
                    </button>
                    <button
                        onClick={() => setTab("history")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${tab === "history"
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-text-secondary hover:text-white"
                            }`}
                    >
                        <History className="w-3 h-3" />
                        Trade History
                    </button>
                </div>
            </div>

            {tab === "history" ? (
                <TradeHistory userId={userId} className="flex-1 min-h-0" />
            ) : (
                <>
                    {isLoading && (
                        <div className="flex-1 flex items-center justify-center text-text-secondary">
                            Loading positions...
                        </div>
                    )}

                    {isEmpty && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                            <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                                <Ghost size={32} className="text-gray-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">No active open positions</h4>
                                <p className="text-sm text-text-secondary max-w-xs mx-auto mt-1">
                                    Your active trades will appear here. Start trading to build your portfolio.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isEmpty && (
                        <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 min-h-0">
                            <Table>
                                <TableHeader className="sticky top-0 bg-[#0f1115] z-10">
                                    <TableRow className="border-none hover:bg-transparent text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                                        <TableHead className="pl-4 w-[40%]">Market</TableHead>
                                        <TableHead className="text-right">Avg <span className="text-gray-600">→</span> Now</TableHead>
                                        <TableHead className="text-right">Bet</TableHead>
                                        <TableHead className="text-right">To Win</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead className="w-[120px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions?.map((pos: any) => {
                                        const isProfit = (pos.percentPnl || 0) >= 0;
                                        const toWin = pos.shares * 1.0; // Max payout if outcome occurs

                                        return (
                                            <TableRow key={pos.id} className="border-none even:bg-white/5 hover:bg-white/10 transition-colors group">
                                                {/* MARKET */}
                                                <TableCell className="pl-4 py-3 align-top">
                                                    <div className="flex gap-3">
                                                        {/* Icon */}
                                                        <div className="w-10 h-10 rounded-md bg-white/10 overflow-hidden shrink-0 mt-0.5">
                                                            {pos.icon ? (
                                                                <img src={pos.icon} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs text-secondary">?</div>
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex flex-col gap-1 min-w-0">
                                                            <p className="text-white font-medium text-sm truncate leading-tight pr-4" title={pos.marketTitle}>
                                                                {pos.marketTitle}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className={`px-1.5 py-0.5 rounded font-bold ${pos.outcome?.toUpperCase() === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {pos.outcome} {pos.currentPrice?.toFixed(2)}¢
                                                                </span>
                                                                <span className="text-text-secondary">
                                                                    {pos.shares} shares
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* AVG -> NOW */}
                                                <TableCell className="text-right font-mono text-sm py-3 align-top">
                                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                                        <span className="text-gray-400">{(pos.avgEntryPrice * 100).toFixed(1)}¢</span>
                                                        <span className="text-gray-600">→</span>
                                                        <span className="text-white font-bold">{(pos.currentPrice * 100).toFixed(1)}¢</span>
                                                    </div>
                                                </TableCell>

                                                {/* BET (Initial Value) */}
                                                <TableCell className="text-right py-3 align-top">
                                                    <p className="text-gray-300 font-mono text-sm mt-1">
                                                        ${pos.initialValue?.toFixed(2) || "0.00"}
                                                    </p>
                                                </TableCell>

                                                {/* TO WIN (Max Payout) */}
                                                <TableCell className="text-right py-3 align-top">
                                                    <p className="text-gray-300 font-mono text-sm mt-1">
                                                        ${toWin.toFixed(2)}
                                                    </p>
                                                </TableCell>

                                                {/* VALUE (Current + PnL) */}
                                                <TableCell className="text-right py-3 align-top">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-white font-bold font-mono text-sm">
                                                            ${pos.exposure?.toFixed(2) || "0.00"}
                                                        </span>
                                                        <span className={`text-xs font-mono whitespace-nowrap ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                                                            {isProfit ? "+" : ""}{pos.pnl?.toFixed(2)} ({pos.percentPnl?.toFixed(2)}%)
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* ACTIONS */}
                                                <TableCell className="text-right pr-4 py-3 align-middle">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <PnLCard data={{
                                                            marketTitle: pos.marketTitle,
                                                            outcome: pos.outcome,
                                                            pnl: pos.pnl || 0,
                                                            pnlPercent: pos.percentPnl || 0,
                                                            bought: pos.initialValue || 0,
                                                            position: pos.exposure || 0
                                                        }} />
                                                        <button
                                                            onClick={() => confirmClose(pos)}
                                                            disabled={!!closingId}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {closingId === pos.marketId ? (
                                                                <Activity className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                "Sell"
                                                            )}
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
