import { useState, useEffect } from "react";
import { useUserSettings, useUpdateSettings, useImportWallet } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

interface UserSettingsProps {
    dbUserId: string;
}

export default function UserSettings({ dbUserId }: UserSettingsProps) {
    const { data: settings } = useUserSettings(dbUserId);
    const updateSettings = useUpdateSettings();

    const [formData, setFormData] = useState({
        maxTradeAmount: 100,
        maxMarketExposure: 500,
        maxTotalExposure: 2000,
        tradeCooldownSeconds: 300,
    });

    const [proxyWalletAddress, setProxyWalletAddress] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isCreatingProxy, setIsCreatingProxy] = useState(false);

    // Import State
    const [importPK, setImportPK] = useState("");
    const [importProxy, setImportProxy] = useState("");

    // Update form when settings are fetched
    useEffect(() => {
        if (settings) {
            setFormData(prev => ({
                maxTradeAmount: settings.maxTradeAmount ?? prev.maxTradeAmount,
                maxMarketExposure: settings.maxMarketExposure ?? prev.maxMarketExposure,
                maxTotalExposure: settings.maxTotalExposure ?? prev.maxTotalExposure,
                tradeCooldownSeconds: settings.tradeCooldownSeconds ?? prev.tradeCooldownSeconds,
            }));
            // Map 'proxyWallet' (from DB) to our local state 'proxyWalletAddress'
            // DB field is 'proxyWallet' or 'proxyAddress' depending on what we returned.
            // The existing API hook probably returns 'proxyWallet' property.
            // Let's check user.routes.ts... it returns `proxyWallet` in the select.
            // But wait, I updated the SCHEMA to `proxyAddress` but the ROUTE `POST /settings` 
            // selects `proxyWallet: true`. 
            // I need to check if I updated the `POST /settings` route to select `proxyAddress`.
            // I DID NOT update the select in `POST /settings` in Step 3121. I only looked at it.
            // Step 3121 view showed `proxyWallet: true`.
            // Step 3107 changed schema to `proxyAddress`.
            // THIS MEANS `POST /settings` IS BROKEN too because `proxyWallet` column doesn't exist anymore!

            // I MUST FIX THE ROUTE FIRST/ALSO. 
            // For now, in frontend, I will assume the key might be missing or I'll fix the route next.
            // Let's assume I will fix the route to return `proxyAddress`.
            if ((settings as any).proxyAddress || (settings as any).proxyWallet) {
                setProxyWalletAddress((settings as any).proxyAddress || (settings as any).proxyWallet);
            }
        }
    }, [settings]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings.mutateAsync({
                userId: dbUserId,
                ...formData,
            });
            setMessage({ type: "success", text: "Risk configuration updated successfully" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update settings" });
        }
    };

    const importWalletMutation = useImportWallet();

    const handleImportProxy = async () => {
        setIsCreatingProxy(true);
        try {
            const data = await importWalletMutation.mutateAsync({
                userId: dbUserId,
                privateKey: importPK,
                proxyAddress: importProxy
            });

            setMessage({ type: "success", text: "Wallet imported successfully!" });
            setProxyWalletAddress(data.address);

            // Query invalidation handled in hook onSuccess

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to import wallet" });
        } finally {
            setIsCreatingProxy(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
                <p className="text-text-secondary mt-2">Manage global risk parameters and account integrations.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                    {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Management Section */}
                <Card className="bg-panel border-transparent shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-white">Risk Configuration</CardTitle>
                                <CardDescription>Set safety limits for your autonomous agents.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Max Trade Amount</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.maxTradeAmount}
                                        onChange={(e) => setFormData({ ...formData, maxTradeAmount: parseFloat(e.target.value) })}
                                        className="bg-black/20 border-white/10 text-white pr-16 focus-visible:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">USDC</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Max Market Exp.</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.maxMarketExposure}
                                        onChange={(e) => setFormData({ ...formData, maxMarketExposure: parseFloat(e.target.value) })}
                                        className="bg-black/20 border-white/10 text-white pr-16 focus-visible:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">USDC</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Total Account Exp.</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.maxTotalExposure}
                                        onChange={(e) => setFormData({ ...formData, maxTotalExposure: parseFloat(e.target.value) })}
                                        className="bg-black/20 border-white/10 text-white pr-16 focus-visible:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">USDC</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Trade Cooldown</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.tradeCooldownSeconds}
                                        onChange={(e) => setFormData({ ...formData, tradeCooldownSeconds: parseInt(e.target.value) })}
                                        className="bg-black/20 border-white/10 text-white pr-16 focus-visible:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">SEC</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveSettings}
                            disabled={updateSettings.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                        >
                            {updateSettings.isPending ? "Saving..." : "Update Risk Parameters"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Integrations Section */}
                <Card className="bg-panel border-transparent shadow-lg h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-white">Proxy Trading Wallet</CardTitle>
                                <CardDescription>Server-managed Smart Account for autonomous trading.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {proxyWalletAddress ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                    <h3 className="text-sm font-medium text-purple-300 mb-1">Active Proxy Address</h3>
                                    <div className="flex items-center justify-between gap-2">
                                        <code className="text-xs text-white/80 font-mono break-all bg-black/30 p-2 rounded w-full">
                                            {proxyWalletAddress}
                                        </code>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                                    <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                    <p className="text-xs text-blue-200 leading-relaxed">
                                        <strong>Action Required:</strong> Send Bridged USDC to this address to fund your agent's trading activities.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    To enable autonomous trading, you must import your existing Polymarket Proxy wallet and its controlling Private Key.
                                </p>
                                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20 mb-4 flex gap-3">
                                    <ShieldAlert className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-blue-300">Security Guarantee</p>
                                        <p className="text-xs text-blue-200/80 leading-relaxed">
                                            Your Private Key is encrypted using <strong>AES-256-GCM</strong> with a user-specific key derived via <strong>HKDF</strong>. It is never stored in plain text and is only decrypted in memory for autonomously signing transactions by the agents.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-white/5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-400">Owner Private Key</label>
                                        <Input
                                            type="password"
                                            placeholder="0x..."
                                            value={importPK}
                                            onChange={(e) => setImportPK(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white text-xs font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-400">Proxy Address</label>
                                        <Input
                                            placeholder="0x..."
                                            value={importProxy}
                                            onChange={(e) => setImportProxy(e.target.value)}
                                            className="bg-black/40 border-white/10 text-white text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleImportProxy}
                                    disabled={isCreatingProxy || !importPK || !importProxy}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium"
                                >
                                    {isCreatingProxy ? "Importing..." : "Import Trading Credentials"}
                                </Button>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Status</span>
                                <span className={`flex items-center gap-1.5 ${proxyWalletAddress ? "text-emerald-400" : "text-gray-400"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${proxyWalletAddress ? "bg-emerald-400" : "bg-gray-400"}`} />
                                    {proxyWalletAddress ? "Ready for Funding" : "Not Initialized"}
                                </span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Private Key Export Section */}
                {proxyWalletAddress && (
                    <Card className="bg-red-950/10 border-red-500/20 shadow-lg h-fit">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-white">Export Private Key</CardTitle>
                                    <CardDescription>Retrieve your trading key for external use.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-red-500/5 rounded border border-red-500/10 mb-2">
                                <p className="text-xs text-red-200 leading-relaxed font-medium">
                                    WARNING: Anyone with this key can access your funds. Never share it.
                                </p>
                            </div>
                            <ExportKeyButton userId={dbUserId} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

const ExportKeyButton = ({ userId }: { userId: string }) => {
    const [key, setKey] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);

    const handleReveal = async () => {
        if (revealed) {
            setKey(null);
            setRevealed(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/user/proxy/export?userId=${userId}`);
            const data = await res.json();
            if (data.privateKey) {
                setKey(data.privateKey);
                setRevealed(true);
            }
        } catch (e) {
            console.error("Failed to export key", e);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                onClick={handleReveal}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
                {revealed ? "Hide Private Key" : "Reveal Private Key"}
            </Button>
            {revealed && key && (
                <div className="p-3 bg-black/40 rounded border border-red-500/20 font-mono text-xs break-all text-red-200 select-all">
                    {key}
                </div>
            )}
        </div>
    );
};
