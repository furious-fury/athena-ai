import { useState } from "react";
import { useAgents, useControlAgent, useCreateAgent, useDeleteAgent, useUpdateAgent } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function AgentControl({ dbUserId, variant = "full" }: { dbUserId: string | null, variant?: "full" | "compact" }) {
    const { publicKey } = useWallet();

    const { data: agents } = useAgents(dbUserId);
    const { mutate: controlAgent } = useControlAgent();
    const { mutate: createAgent, isPending: isCreating } = useCreateAgent();
    const { mutate: deleteAgent, isPending: isDeleting } = useDeleteAgent();
    const { mutate: updateAgent, isPending: isUpdating } = useUpdateAgent();

    // Form State
    const [name, setName] = useState("");
    const [riskProfile, setRiskProfile] = useState("MEDIUM");
    const [llmProvider, setLlmProvider] = useState("OPENAI");
    const [stopLoss, setStopLoss] = useState("20");
    const [takeProfit, setTakeProfit] = useState("100");

    const [isOpen, setIsOpen] = useState(false);

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<any>(null);

    const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);

    const handleToggle = (agentId: string, isRunning: boolean) => {
        if (!dbUserId) return alert("Please wait for login...");
        controlAgent({ agentId, action: isRunning ? "stop" : "start", userId: dbUserId });
    };

    const handleDelete = (agentId: string) => {
        setDeleteAgentId(agentId);
    };

    const confirmDelete = () => {
        if (deleteAgentId) {
            deleteAgent(deleteAgentId);
            setDeleteAgentId(null);
        }
    };

    const handleCreate = () => {
        if (!name || !riskProfile) return;
        if (!dbUserId) return alert("Please wait for login...");

        createAgent({
            name,
            description: "User Created",
            riskProfile,
            userId: dbUserId,
            stopLossPercent: !isNaN(parseFloat(stopLoss)) ? parseFloat(stopLoss) : 20,
            takeProfitPercent: !isNaN(parseFloat(takeProfit)) ? parseFloat(takeProfit) : 100,
            llmProvider
        }, {
            onSuccess: () => {
                setIsOpen(false);
                setName("");
                setRiskProfile("MEDIUM");
                setLlmProvider("OPENAI");
                setStopLoss("20");
                setTakeProfit("100");
                toast.success("Agent deployed successfully!");
            },
            onError: (err) => {
                toast.error(`Failed to deploy agent: ${err.message}`);
            }
        });
    }

    const openEdit = (agent: any) => {
        setEditingAgent(agent);
        setName(agent.name);
        setRiskProfile(agent.riskProfile);
        setStopLoss(agent.stopLossPercent?.toString() || "20");
        setTakeProfit(agent.takeProfitPercent?.toString() || "100");
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!editingAgent || !dbUserId) return;
        updateAgent({
            agentId: editingAgent.id,
            data: {
                userId: dbUserId,
                name,
                riskProfile,
                stopLossPercent: !isNaN(parseFloat(stopLoss)) ? parseFloat(stopLoss) : undefined,
                takeProfitPercent: !isNaN(parseFloat(takeProfit)) ? parseFloat(takeProfit) : undefined
            }
        }, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingAgent(null);
                toast.success("Agent settings updated successfully!");
            },
            onError: (err) => {
                toast.error(`Failed to update settings: ${err.message}`);
            }
        });
    };

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
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setIsOpen(true)}
                                className="bg-accent text-white hover:bg-accent/90 shadow-[0_0_15px_rgba(58,123,255,0.3)] border-none"
                            >
                                + Deploy New Agent
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Agent Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-panel border-none text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Deploy New Agent</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Configure a new AI agent with a name, provider, and risk profile.
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">LLM Provider</label>
                                <select
                                    value={llmProvider}
                                    onChange={(e) => setLlmProvider(e.target.value)}
                                    className="w-full bg-black/30 border-transparent rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="OPENAI" className="bg-panel text-white">OpenAI - GPT</option>
                                    <option value="GEMINI" className="bg-panel text-white">Google - Gemini</option>
                                    <option value="ANTHROPIC" className="bg-panel text-white">Anthropic - Claude</option>
                                </select>
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Stop Loss (%)</label>
                                <Input
                                    type="number"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    placeholder="20"
                                    className="bg-black/30 border-transparent text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Take Profit (%)</label>
                                <Input
                                    type="number"
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                    placeholder="100"
                                    className="bg-black/30 border-transparent text-white"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="w-full bg-[#3A7BFF] text-white hover:bg-[#3A7BFF]/90 font-bold shadow-lg shadow-blue-900/20 mt-6"
                        >
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deploy Agent"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Agent Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-panel border-none text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Agent Settings</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update risk parameters for {editingAgent?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Agent Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/30 border-transparent text-white placeholder:text-gray-500"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Stop Loss (%)</label>
                                <Input
                                    type="number"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    className="bg-black/30 border-transparent text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Take Profit (%)</label>
                                <Input
                                    type="number"
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                    className="bg-black/30 border-transparent text-white"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="w-full bg-[#3A7BFF] text-white hover:bg-[#3A7BFF]/90 font-bold shadow-lg shadow-blue-900/20 mt-6"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Agent Confirmation Dialog */}
            <Dialog open={deleteAgentId !== null} onOpenChange={(open) => !open && setDeleteAgentId(null)}>
                <DialogContent className="bg-panel border-none text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Delete Agent</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to delete this agent? This action is irreversible and all agent data will be permanently lost.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={() => setDeleteAgentId(null)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Agent"}
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
                                        disabled={!publicKey}
                                        className={`flex-1 font-bold transition-all duration-300 ${agent.isRunning
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                                            : "bg-blue-600/50 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border-none hover:scale-[1.02]"
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
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => openEdit(agent)}
                                        className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10"
                                    >
                                        <Settings className="w-4 h-4" />
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
