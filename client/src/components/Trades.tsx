import { useTrades } from "../lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function Trades({ dbUserId }: { dbUserId: string | null }) {
    const { data: trades, isLoading } = useTrades(dbUserId || "");

    if (!dbUserId) return <div className="text-center p-10 text-muted-foreground w-1/2">Connect wallet to view trades.</div>;

    return (
        <div className='container w-3/5 mx-auto p-8 rounded-sm outline-1 outline-muted-foreground text-muted-foreground'>
            <h1 className='text-2xl font-bold text-muted-foreground text-center mb-8'>Recent Trades</h1>

            <div className='mx-auto p-5'>
                <Table className="w-full overflow-x-hidden">
                    <TableHeader>
                        <TableRow className="">
                            <TableHead className="text-base font-bold text-white text-center">Market</TableHead>
                            <TableHead className="text-base font-bold text-white text-center">Side</TableHead>
                            <TableHead className="text-base font-bold text-white text-center">Outcome</TableHead>
                            <TableHead className="text-base font-bold text-white text-center">Amount</TableHead>
                            <TableHead className="text-base font-bold text-white text-center">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
                        {!isLoading && trades?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No trades found.</TableCell></TableRow>}
                        {trades?.map((trade: any) => (
                            <TableRow key={trade.id} className="">
                                <TableCell><p className="py-5 text-white truncate max-w-[200px]">{trade.marketId}</p></TableCell>
                                <TableCell><p className={`text-center font-bold ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{trade.side}</p></TableCell>
                                <TableCell><p className="py-5 text-white text-center">{trade.outcome}</p></TableCell>
                                <TableCell><p className="py-5 text-white text-center">{trade.amount}</p></TableCell>
                                <TableCell><p className="py-5 text-white text-center">{new Date(trade.createdAt).toLocaleTimeString()}</p></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default Trades