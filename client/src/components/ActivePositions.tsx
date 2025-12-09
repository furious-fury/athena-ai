import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Ghost } from "lucide-react";
import { useUserPositions } from "../lib/api";

interface ActivePositionsProps {
    userId: string | null;
    className?: string;
}

export default function ActivePositions({ userId, className }: ActivePositionsProps) {
    const { data: positions, isLoading } = useUserPositions(userId || "");

    const isEmpty = !isLoading && (!positions || positions.length === 0);

    return (
        <Card className={`bg-panel border-transparent p-6 overflow-hidden flex flex-col ${className || 'h-[400px]'}`}>
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-white">Active Positions</h3>
                    <p className="text-text-secondary text-sm">Manage your open prediction market bets.</p>
                </div>
            </div>

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
                <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
                    <Table>
                        <TableHeader className="sticky top-0 bg-[#0f1115] z-10">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-white/60 font-bold uppercase tracking-wider text-xs">Market</TableHead>
                                <TableHead className="text-white/60 font-bold uppercase tracking-wider text-xs text-center">Outcome</TableHead>
                                <TableHead className="text-white/60 font-bold uppercase tracking-wider text-xs text-right">Shares</TableHead>
                                <TableHead className="text-white/60 font-bold uppercase tracking-wider text-xs text-right">Avg Price</TableHead>
                                <TableHead className="text-white/60 font-bold uppercase tracking-wider text-xs text-right">Exposure</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {positions?.map((pos: any) => (
                                <TableRow key={pos.id} className="border-none even:bg-white/5 hover:bg-white/10 transition-colors group">
                                    <TableCell className="max-w-[300px]">
                                        <div className="flex items-center gap-3">
                                            <p className="font-medium text-white truncate max-w-[200px]" title={pos.marketTitle || pos.marketId}>
                                                {pos.marketTitle || `Market ${pos.marketId.substring(0, 8)}...`}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${pos.outcome === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {pos.outcome}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <p className="text-white font-mono">{pos.shares}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        <span className="text-gray-400">{pos.avgEntryPrice?.toFixed(3) || "N/A"}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <p className="text-white font-mono">${pos.exposure?.toFixed(2) || "0.00"}</p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
}
