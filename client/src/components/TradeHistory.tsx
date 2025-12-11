
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Ghost, PlusCircle, MinusCircle } from "lucide-react";
import { useTrades } from "../lib/api";
import { formatDistanceToNow } from "date-fns";

interface TradeHistoryProps {
    userId: string | null;
    className?: string;
}

export default function TradeHistory({ userId, className }: TradeHistoryProps) {
    const { data: trades, isLoading } = useTrades(userId || "");
    const isEmpty = !isLoading && (!trades || trades.length === 0);

    return (
        <div className={`flex flex-col ${className || 'h-[400px]'}`}>
            {isLoading && (
                <div className="flex-1 flex items-center justify-center text-text-secondary">
                    Loading history...
                </div>
            )}

            {isEmpty && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                        <Ghost size={32} className="text-gray-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">No trade history</h4>
                        <p className="text-sm text-text-secondary max-w-xs mx-auto mt-1">
                            Your executed trades will appear here.
                        </p>
                    </div>
                </div>
            )}

            {!isLoading && !isEmpty && (
                <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 min-h-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-[#0f1115] z-10">
                            <TableRow className="border-none hover:bg-transparent text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                                <TableHead className="pl-4 w-[120px]">Activity</TableHead>
                                <TableHead>Market</TableHead>
                                <TableHead className="text-right pr-4">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades?.map((trade: any) => {
                                const isBuy = trade.side === "BUY";
                                const value = parseFloat(trade.size) * parseFloat(trade.price);
                                const timeAgo = trade.timestamp
                                    ? formatDistanceToNow(trade.timestamp * 1000, { addSuffix: true })
                                    : "Just now";

                                return (
                                    <TableRow key={trade.id || trade.transactionHash} className="border-none even:bg-white/5 hover:bg-white/10 transition-colors group">
                                        {/* ACTIVITY */}
                                        <TableCell className="pl-4 py-3 align-top">
                                            <div className="flex items-center gap-2">
                                                {isBuy ? (
                                                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                                ) : (
                                                    <MinusCircle className="w-4 h-4 text-gray-400 shrink-0" />
                                                )}
                                                <span className="font-bold text-white text-sm">
                                                    {isBuy ? "Bought" : "Sold"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* MARKET */}
                                        <TableCell className="py-3 align-top">
                                            <div className="flex gap-3">
                                                {/* Market Icon */}
                                                <div className="w-10 h-10 rounded-md bg-white/10 overflow-hidden shrink-0 mt-0.5">
                                                    {trade.icon ? (
                                                        <img src={trade.icon} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-secondary">?</div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <p className="text-white font-medium text-sm truncate leading-tight pr-4" title={trade.market}>
                                                        {trade.market}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                                        <span className={`px-1.5 py-0.5 rounded font-bold ${trade.outcome?.toUpperCase() === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {trade.outcome || "YES"}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {(parseFloat(trade.price) * 100).toFixed(1)}¢
                                                        </span>
                                                        <span className="text-text-secondary">•</span>
                                                        <span className="text-text-secondary">
                                                            {parseFloat(trade.size).toFixed(1)} shares
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* VALUE */}
                                        <TableCell className="pr-4 py-3 align-top text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`font-mono text-sm font-medium ${isBuy ? 'text-white' : 'text-emerald-400'}`}>
                                                    {isBuy ? "-" : "+"}${value.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-text-secondary whitespace-nowrap">
                                                    {timeAgo}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
