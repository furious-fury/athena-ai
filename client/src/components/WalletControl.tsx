import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, Copy, Check, Loader2 } from "lucide-react";
import { parseAbi, parseUnits } from "viem";
import { polygon } from "viem/chains";
import { useProxyWallet } from "../lib/api";
import { useWalletClient } from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProxyUSDCBalance } from "../hooks/useProxyUSDCBalance";

const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

interface WalletControlProps {
    userId: string | null;
    proxyAddress: string | null;
    className?: string;
}

export default function WalletControl({ userId, proxyAddress, className }: WalletControlProps) {
    const { data: walletClient } = useWalletClient();
    // We still fetch proxy data but don't rely on its stale balance
    useProxyWallet(userId || "");
    const { formatted: balanceFormatted, refetch: refetchBalance } = useProxyUSDCBalance(userId);
    const queryClient = useQueryClient();

    const [action, setAction] = useState<"deposit" | "withdraw" | null>(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (proxyAddress) {
            navigator.clipboard.writeText(proxyAddress);
            setCopied(true);
            toast.success("Address copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleMax = () => {
        if (action === "withdraw" && balanceFormatted) {
            // Remove commas if any, though our formatted currently doesn't have them
            setAmount(balanceFormatted.replace(/,/g, ''));
        }
    };

    const handleExecute = async () => {
        if (!amount || isNaN(parseFloat(amount))) return toast.error("Please enter a valid amount");
        setLoading(true);

        try {
            if (action === "deposit") {
                if (!walletClient || !proxyAddress) return toast.error("Wallet not connected");

                const [address] = await walletClient.getAddresses();
                const parsedAmount = parseUnits(amount, 6); // USDC 6 decimals

                // Transfer USDC
                const hash = await walletClient.writeContract({
                    address: USDC_ADDRESS,
                    abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
                    functionName: 'transfer',
                    args: [proxyAddress as `0x${string}`, parsedAmount],
                    account: address,
                    chain: polygon
                });

                toast.success("Deposit Initiated", {
                    description: (
                        <div className="flex flex-col gap-1">
                            <span>Transaction submitted</span>
                            <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                View on Explorer <ArrowUpRight size={12} />
                            </a>
                        </div>
                    ),
                    duration: 8000
                });

                // Immediately invalidate to trigger a check, though chain might be slow
                queryClient.invalidateQueries({ queryKey: ["proxyWallet", userId] });
                refetchBalance(); // Try to refetch on-chain balance

                setAction(null);

            } else if (action === "withdraw") {
                if (!userId) return;
                // Server-side execution
                const res = await fetch("http://localhost:5000/api/user/proxy/withdraw", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, amount, currency: "USDC" })
                });

                const data = await res.json();
                if (data.success) {
                    toast.success("Withdrawal Successful", {
                        description: (
                            <div className="flex flex-col gap-1">
                                <span>Funds sent to your wallet</span>
                                <a href={`https://polygonscan.com/tx/${data.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                    View on Explorer <ArrowUpRight size={12} />
                                </a>
                            </div>
                        ),
                        duration: 8000
                    });
                    setAction(null);
                    // Invalidate balance query to refresh UI
                    queryClient.invalidateQueries({ queryKey: ["proxyWallet", userId] });
                    refetchBalance();
                } else {
                    throw new Error(data.error || "Failed");
                }
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Transaction Failed", {
                description: e.message || "Unknown error occurred"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!proxyAddress) return null;

    return (
        <>
            <div className={className || "flex gap-3 mb-6"}>
                <Button
                    variant="outline"
                    className="flex-1 bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 gap-2 h-12"
                    onClick={() => setAction("deposit")}
                >
                    <ArrowDownLeft size={18} />
                    Deposit Funds
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 gap-2 h-12"
                    onClick={() => {
                        setAction("withdraw");
                        setAmount(""); // Reset amount on open
                    }}
                >
                    <ArrowUpRight size={18} />
                    Withdraw Funds
                </Button>
            </div>

            <Dialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
                <DialogContent className="bg-panel border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{action === "deposit" ? "Deposit to Proxy" : "Withdraw to Wallet"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {action === "deposit"
                                ? "Send USDC from your connected wallet to your trading proxy."
                                : "Withdraw USDC from your trading proxy to your connected wallet."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {action === "withdraw" && (
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-400">Available Balance:</span>
                                <span className="font-mono text-white">
                                    ${balanceFormatted} USDC
                                </span>
                            </div>
                        )}

                        {action === "deposit" && (
                            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between mb-4">
                                <div className="truncate text-xs text-gray-400 font-mono">
                                    {proxyAddress}
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopy}>
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium">Amount (USDC)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white pr-16"
                                />
                                {action === "withdraw" && (
                                    <button
                                        onClick={handleMax}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400 hover:text-blue-300 px-2 py-1"
                                    >
                                        MAX
                                    </button>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleExecute}
                            disabled={loading}
                            className={`w-full font-bold ${action === "deposit" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (action === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
