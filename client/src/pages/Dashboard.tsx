import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Agent {
    id: string;
    name: string;
    description: string;
    isRunning: boolean;
}

interface Trade {
    id: string;
    marketId: string;
    side: "BUY" | "SELL";
    amount: number;
    outcome: string;
    price?: number;
    createdAt: string;
}

export default function Dashboard() {
    const { publicKey, connected } = useWallet();
    const address = publicKey?.toString();
    const isConnected = connected;

    console.log("Dashboard Render:", { isConnected, address });

    const [agents, setAgents] = useState<Agent[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);

    const [dbUserId, setDbUserId] = useState<string | null>(null);

    // Fetch data
    useEffect(() => {
        console.log("Login Effect Triggered", { isConnected, address });
        if (isConnected && address) {
            console.log("Calling loginUser with", address);
            loginUser(address);
        } else {
            console.log("Skipping loginUser - Missing address or not connected");
        }
    }, [isConnected, address]);

    useEffect(() => {
        if (isConnected && dbUserId) {
            fetchAgents();
            fetchTrades();
            const interval = setInterval(fetchAgents, 5000); // Poll agent status
            return () => clearInterval(interval);
        }
    }, [isConnected, dbUserId]);

    const loginUser = async (walletAddress: string) => {
        console.log("loginUser function called for", walletAddress);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress })
            });
            console.log("Login response status:", res.status);
            const data = await res.json();
            console.log("Login returned data:", data);
            if (data.success) {
                setDbUserId(data.user.id);
            }
        } catch (err) {
            console.error("Failed to login user", err);
        }
    }

     
    const fetchAgents = async () => {
        try {
            if (!dbUserId) return;
            const res = await fetch(`${API_URL}/agents?userId=${dbUserId}`);
            const data = await res.json();
            if (data.success) setAgents(data.agents);
        } catch (err) {
            console.error("Failed to fetch agents", err);
        }
    };

    const fetchTrades = async () => {
        if (!dbUserId) return; // Need DB ID, not just address
        try {
            // NOTE: The trade history endpoint currently expects a user ID (database ID)
            const res = await fetch(`${API_URL}/trade/history/${dbUserId}`);
            const data = await res.json();
            if (data.success) setTrades(data.trades);
        } catch (err) {
            console.error("Failed to fetch trades", err);
        }
    };

    useEffect(() => {
        if (isConnected && dbUserId) {
            fetchAgents();
            fetchTrades();
            const interval = setInterval(fetchAgents, 5000); // Poll agent status
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, dbUserId]);

    const toggleAgent = async (agentId: string, isRunning: boolean) => {
        if (!dbUserId) return;
        try {
            const endpoint = isRunning ? "stop" : "start";
            const res = await fetch(`${API_URL}/agents/${agentId}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: dbUserId }) // Pass DB ID
            });
            const data = await res.json();
            if (data.success) {
                fetchAgents(); // Refresh UI
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Action failed", err);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold">Poly-Dapp Agent Dashboard</h1>
                    <p className="mb-8 text-gray-400">Connect your wallet to manage your AI agents.</p>
                    {/* Dynamic Widget is better placed in the header, but we can instruct user */}
                    <p className="text-xl animate-pulse">Please connect using the wallet button in the top right.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="text-sm text-gray-400">
                    Connected: <span className="text-green-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* AGENTS PANEL */}
                <div className="rounded-lg bg-gray-800 p-6">
                    <h2 className="mb-4 text-xl font-semibold">🤖 Active Agents</h2>
                    <div className="space-y-4">
                        {agents.length === 0 && <p className="text-gray-500">No agents registered.</p>}
                        {agents.map((agent) => (
                            <div key={agent.id} className="flex items-center justify-between rounded bg-gray-700 p-4">
                                <div>
                                    <h3 className="font-bold">{agent.name}</h3>
                                    <p className="text-sm text-gray-400">{agent.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${agent.isRunning ? "bg-green-500" : "bg-red-500"}`}></div>
                                    <button
                                        onClick={() => toggleAgent(agent.id, agent.isRunning)}
                                        className={`rounded px-3 py-1 text-sm font-bold ${agent.isRunning ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
                                            }`}
                                    >
                                        {agent.isRunning ? "STOP" : "START"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TRADES PANEL */}
                <div className="rounded-lg bg-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Recent Trades</h2>
                        <button onClick={fetchTrades} className="text-sm text-blue-400 hover:underline">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-700 text-gray-300">
                                <tr>
                                    <th className="p-2">Market</th>
                                    <th className="p-2">Side</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Result</th>
                                    <th className="p-2">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {trades.length === 0 && (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">No trades yet.</td></tr>
                                )}
                                {trades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-gray-700/50">
                                        <td className="p-2 font-mono">{trade.marketId.slice(0, 8)}...</td>
                                        <td className={`p-2 font-bold ${trade.side === "BUY" ? "text-green-400" : "text-red-400"}`}>
                                            {trade.side}
                                        </td>
                                        <td className="p-2">{trade.amount}</td>
                                        <td className="p-2">{trade.outcome}</td>
                                        <td className="p-2 text-gray-500">{new Date(trade.createdAt).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
