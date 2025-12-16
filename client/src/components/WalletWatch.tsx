import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "./ui/dialog";

interface WalletWatchProps {
    userId: string;
}

interface Trade {
    id: string;
    market: string;
    side: string;
    outcome: string;
    size: string;
    price: string;
    timestamp: number;
    transactionHash: string;
    icon?: string;
}

interface Position {
    asset: string;
    title: string;
    market: string;
    outcome: string;
    size: number;
    value: number;
    price: number;
    initialValue: number;
    pnl: number;
    icon?: string;
}

export function WalletWatch({ userId }: WalletWatchProps) {
    const [wallets, setWallets] = useState<Array<{ address: string, name: string | null }>>([]);
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
    const [newWallet, setNewWallet] = useState("");
    const [newWalletName, setNewWalletName] = useState("");
    const [trades, setTrades] = useState<Trade[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [viewMode, setViewMode] = useState<"history" | "positions">("positions");
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

    const cache = useRef<{ [key: string]: { trades?: { data: Trade[], ts: number }, positions?: { data: Position[], ts: number } } }>({});
    const CACHE_DURATION = 20000; // 20 seconds

    // Initial Load
    useEffect(() => {
        if (userId) fetchWallets();
    }, [userId]);

    // Fetch data when wallet or view mode changes
    useEffect(() => {
        if (selectedWallet) {
            if (viewMode === "history") fetchHistory(selectedWallet);
            else fetchPositions(selectedWallet);
        }
    }, [selectedWallet, viewMode]);

    const fetchWallets = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/tracked-wallets?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                setWallets(data.wallets);
                if (data.wallets.length > 0 && !selectedWallet) setSelectedWallet(data.wallets[0].address);
            }
        } catch (e) { console.error(e); }
    };

    const addWallet = async () => {
        if (!newWallet || newWallet.length < 10) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/tracked-wallets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, address: newWallet, name: newWalletName })
            });
            const data = await res.json();
            if (data.success) {
                setWallets(data.wallets);
                setNewWallet("");
                setNewWalletName("");
                setSelectedWallet(newWallet);
                setIsDialogOpen(false);
            }
        } finally { setIsLoading(false); }
    };

    const initiateRemoveWallet = (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWalletToDelete(address);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!walletToDelete) return;

        // Optimistic UI update could be done here, but let's wait for server
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/tracked-wallets`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, address: walletToDelete })
            });
            const data = await res.json();
            if (data.success) {
                setWallets(data.wallets);
                // Clear cache for removed wallet
                if (cache.current[walletToDelete]) delete cache.current[walletToDelete];

                if (selectedWallet === walletToDelete) {
                    setSelectedWallet(null);
                    setTrades([]);
                    setPositions([]);
                }
            }
        } catch (e) { } finally {
            setIsDeleteDialogOpen(false);
            setWalletToDelete(null);
        }
    };

    const fetchHistory = async (address: string) => {
        // Check cache
        const cached = cache.current[address]?.trades;
        if (cached && (Date.now() - cached.ts < CACHE_DURATION)) {
            setTrades(cached.data);
            return;
        }

        setIsDataLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/trade/history-address/${address}`);
            const data = await res.json();
            if (data.success) {
                setTrades(data.trades);
                // Update cache
                if (!cache.current[address]) cache.current[address] = {};
                cache.current[address].trades = { data: data.trades, ts: Date.now() };
            } else {
                setTrades([]);
            }
        } catch (e) {
            console.error(e);
            setTrades([]);
        } finally { setIsDataLoading(false); }
    };

    const fetchPositions = async (address: string) => {
        // Check cache
        const cached = cache.current[address]?.positions;
        if (cached && (Date.now() - cached.ts < CACHE_DURATION)) {
            setPositions(cached.data);
            return;
        }

        setIsDataLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/trade/positions-address/${address}`);
            const data = await res.json();
            if (data.success) {
                setPositions(data.positions);
                // Update cache
                if (!cache.current[address]) cache.current[address] = {};
                cache.current[address].positions = { data: data.positions, ts: Date.now() };
            } else {
                setPositions([]);
            }
        } catch (e) {
            console.error(e);
            setPositions([]);
        } finally { setIsDataLoading(false); }
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                    Wallet Watcher
                </h2>
                <p className="text-gray-400">Track external whale wallets and their Polymarket moves.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Wallet List */}
                <div className="bg-panel rounded-2xl border border-white/10 p-4 h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-300">Tracked Wallets</h3>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 gap-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50 transition-all">
                                    <Plus size={14} /> Add Wallet
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1C1C21] border-white/10 text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Track New Wallet</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Enter a wallet address to monitor its Polymarket activity.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Wallet Name (Optional)</label>
                                        <Input
                                            value={newWalletName}
                                            onChange={(e) => setNewWalletName(e.target.value)}
                                            placeholder="e.g. Whale 1"
                                            className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Wallet Address</label>
                                        <Input
                                            value={newWallet}
                                            onChange={(e) => setNewWallet(e.target.value)}
                                            placeholder="0x..."
                                            className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                    <Button onClick={addWallet} disabled={isLoading || !newWallet || newWallet.length < 10} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                                        {isLoading ? "Adding..." : "Start Tracking"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {wallets.map(w => (
                            <div
                                key={w.address}
                                onClick={() => setSelectedWallet(w.address)}
                                className={`p-3 rounded-xl cursor-pointer border transition-all flex justify-between items-center group
                                    ${selectedWallet === w.address ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                `}
                            >
                                <div className="truncate">
                                    <div className={`font-medium text-sm ${selectedWallet === w.address ? 'text-blue-400' : 'text-gray-200'}`}>
                                        {w.name || "Untitled"}
                                    </div>
                                    <div className="text-xs font-mono text-gray-500">
                                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => initiateRemoveWallet(w.address, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {wallets.length === 0 && (
                            <div className="text-center text-gray-600 text-sm py-10">
                                No wallets tracked.
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="bg-[#1C1C21] border-white/10 text-white sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Stop Tracking Wallet?</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Are you sure you want to remove this wallet from your tracking list?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-3 justify-end mt-4">
                                <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="hover:bg-white/10 text-gray-400 hover:text-white">
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20">
                                    Remove Wallet
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main: Trade History */}
                <div className="lg:col-span-3 bg-panel rounded-2xl border border-white/10 p-6 flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {selectedWallet ? (
                                <>
                                    <span className="font-mono text-blue-400 text-base">
                                        {wallets.find(w => w.address === selectedWallet)?.name ||
                                            `${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-6)}`}
                                    </span>
                                    {wallets.find(w => w.address === selectedWallet)?.name && (
                                        <span className="text-xs text-gray-500 font-mono">
                                            ({selectedWallet.slice(0, 4)}...{selectedWallet.slice(-4)})
                                        </span>
                                    )}
                                    <a href={`https://polyscan.com/address/${selectedWallet}`} target="_blank" className="text-gray-500 hover:text-white">
                                        <ExternalLink size={14} />
                                    </a>
                                </>
                            ) : "Select a wallet"}
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setViewMode("positions")}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "positions" ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
                                >
                                    Active Positions
                                </button>
                                <button
                                    onClick={() => setViewMode("history")}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "history" ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
                                >
                                    Trade History
                                </button>
                            </div>
                        </div>
                    </div>

                    {isDataLoading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <span className="animate-pulse">Scanning chain data...</span>
                        </div>
                    ) : viewMode === "history" ? (
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-[#0F0F12]/95 backdrop-blur-sm z-10">
                                    <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                                        <th className="pb-3 pl-2">Time</th>
                                        <th className="pb-3">Market</th>
                                        <th className="pb-3 text-center">Type</th>
                                        <th className="pb-3 text-right">Size</th>
                                        <th className="pb-3 text-right">Price</th>
                                        <th className="pb-3 text-right pr-2">Tx</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {trades.map((t) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-3 pl-2 text-gray-400 w-24">
                                                {new Date(t.timestamp * 1000).toLocaleDateString()}
                                                <div className="text-xs text-gray-600">
                                                    {new Date(t.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-3 max-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-white/10 overflow-hidden shrink-0">
                                                        {t.icon ? <img src={t.icon} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">?</div>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-gray-200" title={t.market}>{t.market}</div>
                                                        <div className={`text-xs font-bold ${t.outcome === 'YES' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {t.outcome}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {t.side}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-300">
                                                {parseFloat(t.size).toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right font-mono text-yellow-500">
                                                {parseFloat(t.price).toFixed(2)}¢
                                            </td>
                                            <td className="py-3 text-right pr-2">
                                                <a
                                                    href={`https://polygonscan.com/tx/${t.transactionHash}`}
                                                    target="_blank"
                                                    className="text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {trades.length === 0 && selectedWallet && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-gray-600">
                                                No trade history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-[#0F0F12]/95 backdrop-blur-sm z-10">
                                    <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                                        <th className="pb-3 pl-2">Market</th>
                                        <th className="pb-3 text-right">Size</th>
                                        <th className="pb-3 text-right">Value</th>
                                        <th className="pb-3 text-right">Price</th>
                                        <th className="pb-3 text-right pr-2">PnL</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {positions.map((p, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 pl-2 max-w-[240px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-white/10 overflow-hidden shrink-0">
                                                        {p.icon ? <img src={p.icon} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">?</div>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-gray-200" title={p.title}>{p.title}</div>
                                                        <div className={`text-xs font-bold ${p.outcome === 'YES' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {p.outcome}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-300">
                                                {p.size.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-200">
                                                ${p.value.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-mono text-yellow-500">
                                                {(p.price * 100).toFixed(1)}¢
                                            </td>
                                            <td className={`py-3 text-right pr-2 font-mono ${p.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {positions.length === 0 && selectedWallet && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-20 text-gray-600">
                                                No active positions.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
