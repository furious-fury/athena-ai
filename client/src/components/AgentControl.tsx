import { useState } from "react";
import { useAgents, useControlAgent, useCreateAgent, useDeleteAgent, useEnableTrading } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Key } from "lucide-react";
import { deriveClobApiKey } from "../lib/clobAuth";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function AgentControl({ dbUserId, variant = "full" }: { dbUserId: string | null, variant?: "full" | "compact" }) {
    const { address } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { data: walletClient } = useWalletClient();

    const { data: agents } = useAgents();
    const { mutate: controlAgent } = useControlAgent();
    const { mutate: createAgent } = useCreateAgent();
    const { mutate: deleteAgent } = useDeleteAgent();
    const { mutate: enableTrading } = useEnableTrading();
    // Form State
    const [name, setName] = useState("");
    const [riskProfile, setRiskProfile] = useState("MEDIUM");
    const [isOpen, setIsOpen] = useState(false);

    const handleEnableTrading = async () => {
        if (!address || !dbUserId) return alert("Please login first");
        if (!walletClient) return alert("Wallet not connected");

        try {
            // 0. Time Sync Check
            // (Keeping user's time check logic as is, it's good practice)
            try {
                const timeRes = await fetch("https://clob.polymarket.com/time");
                const serverTimeText = await timeRes.text();

                let serverTime = 0;
                if (serverTimeText.includes("{")) {
                    const json = JSON.parse(serverTimeText);
                    serverTime = json.time || json.timestamp;
                } else {
                    serverTime = parseInt(serverTimeText.replace(/"/g, ''));
                }

                if (serverTime > 0) {
                    const localTime = Math.floor(Date.now() / 1000);
                    const drift = localTime - serverTime;
                    console.log("[TimeCheck] Local:", localTime, "Server:", serverTime, "Drift:", drift);

                    if (Math.abs(drift) > 10) {
                        const msg = `Your system clock is ${Math.abs(drift)} seconds ${drift < 0 ? 'behind' : 'ahead'} of Polymarket servers.\nPlease sync your computer time and try again.`;
                        alert(msg);
                        return; // Stop execution
                    }
                }
            } catch (timeErr) {
                console.warn("[TimeCheck] Failed to check server time:", timeErr);
            }

            // 1. Switch to Mainnet (Chain ID 1) for Auth Sorting
            // Polymarket L1 Headers require Chain ID 1 in the domain (confirmed via inspection)
            try {
                await switchChainAsync({ chainId: 1 });
            } catch (e) {
                console.error("Network switch failed", e);
                // Continue if already on mainnet or user rejected but we try anyway? 
                // Better to throw or return, but let's try to proceed if it was just a rejection of an already active chain
            }

            // 2. Derive Keys using Shared Utility
            // walletClient directly supports signing
            const creds = await deriveClobApiKey(walletClient as any, address);
            console.log("[ManualSign] Success! Creds:", creds);

            // 3. Send to Backend
            enableTrading({
                userId: dbUserId,
                apiKey: creds.apiKey,
                apiSecret: creds.secret,
                apiPassphrase: creds.passphrase,
                proxyWallet: address || ""
            }, {
                onSuccess: () => {
                    alert("Trading Enabled! 🚀");
                    // Switch back to Polygon
                    switchChainAsync({ chainId: 137 }).catch(console.error);
                },
                onError: (err) => {
                    alert("Failed: " + err.message)
                    // Attempt to switch back even on failure
                    switchChainAsync({ chainId: 137 }).catch(console.error);
                }
            });

        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        }
    }

    const handleToggle = (agentId: string, isRunning: boolean) => {
        if (!dbUserId) return alert("Please wait for login...");
        controlAgent({ agentId, action: isRunning ? "stop" : "start", userId: dbUserId });
    };

    const handleDelete = (agentId: string) => {
        if (!confirm("Are you sure you want to delete this agent? This action is irreversible.")) return;
        deleteAgent(agentId);
    };

    const handleCreate = () => {
        if (!name || !riskProfile) return;
        if (!dbUserId) return alert("Please wait for login...");

        createAgent({ name, description: "User Created", riskProfile, userId: dbUserId }, {
            onSuccess: () => {
                setIsOpen(false);
                setName("");
                setRiskProfile("MEDIUM");
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Header Actions - Only show in full mode */}
            {variant === "full" && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-panel p-4 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Agent Command Center</h2>
                        <p className="text-sm text-text-secondary">Manage and monitor your autonomous trading agents.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="bg-black/20 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400 gap-2 transition-all"
                            onClick={handleEnableTrading}
                        >
                            <Key className="w-4 h-4" />
                            Enable Trading
                        </Button>

                        <Button
                            onClick={() => setIsOpen(true)}
                            className="bg-accent text-white hover:bg-accent/90 shadow-[0_0_15px_rgba(58,123,255,0.3)] border-none"
                        >
                            + Deploy New Agent
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Agent Dialog - Rendered regardless of variant */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-panel border-none text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Deploy New Agent</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Configure a new AI agent with a name and risk profile.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Agent Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Risk Taker"
                                className="bg-black/30 border-transparent text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Risk Profile</label>
                            <select
                                value={riskProfile}
                                onChange={(e) => setRiskProfile(e.target.value)}
                                className="w-full bg-black/30 border-transparent rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="LOW" className="bg-panel text-white">Conservative (Low Risk)</option>
                                <option value="MEDIUM" className="bg-panel text-white">Balanced (Medium Risk)</option>
                                <option value="HIGH" className="bg-panel text-white">Aggressive (High Risk)</option>
                                <option value="DEGEN" className="bg-panel text-white">Degen (Maximum Risk)</option>
                            </select>
                        </div>
                        <Button onClick={handleCreate} className="w-full bg-[#3A7BFF] text-white hover:bg-[#3A7BFF]/90 font-bold shadow-lg shadow-blue-900/20 mt-6">
                            Deploy Agent
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(variant === "compact" ? agents?.slice(0, 3) : agents)?.map((agent: any) => (
                    <Card key={agent.id} className="bg-panel/40 border-transparent hover:border-accent/40 transition-all duration-300 group overflow-hidden relative">
                        {agent.isRunning && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-green-500 to-transparent opacity-50 animate-pulse" />
                        )}
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                                        {agent.name}
                                    </CardTitle>
                                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 min-h-10">
                                        {agent.description || "An autonomous agent optimizing for market opportunities."}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${agent.isRunning
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                    }`}>
                                    {agent.isRunning ? "Active" : "Offline"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-black/20 p-2 rounded">
                                        <p className="text-gray-500 mb-1">Strategy</p>
                                        <p className="font-semibold text-purple-400 capitalize">{agent.riskProfile || "Balanced"}</p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded">
                                        <p className="text-gray-500 mb-1">Last Op</p>
                                        <p className="font-semibold text-gray-300 truncate">Idle</p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        onClick={() => handleToggle(agent.id, agent.isRunning)}
                                        disabled={!address}
                                        className={`flex-1 font-bold ${agent.isRunning
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                                            : "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/50"
                                            }`}
                                    >
                                        {agent.isRunning ? "Stop Agent" : "Start Agent"}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(agent.id)}
                                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State / Add New Placeholder */}
                {(!agents || agents.length === 0) && (
                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-text-secondary border border-dashed border-border rounded-xl bg-black/10">
                        <p className="mb-4">No agents deployed yet.</p>
                        <Button variant="outline" onClick={() => setIsOpen(true)}>Create Your First Agent</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
