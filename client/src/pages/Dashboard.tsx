
import '../App.css'

import Layout from '../components/Layout';
import Portfolio from '../components/Portfolio';
import AgentControl from '../components/AgentControl';
import MarketExplorer from '../components/MarketExplorer';
import UserSettings from '../components/UserSettings';

import { Toaster } from "sonner";

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import GlobalActivityFeed from '../components/GlobalActivityFeed';
import DashboardStats from '../components/DashboardStats';
import { useUserSettings, useLoginUser } from '../lib/api';
import { Zap } from 'lucide-react';


function Dashboard() {
    const { publicKey, connected } = useWallet();

    // App Navigation State - Init from URL or Default
    const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'markets' | 'wallet' | 'settings'>(() => {
        const params = new URLSearchParams(window.location.search);
        return (params.get('tab') as any) || 'dashboard';
    });

    // Sync URL with activeTab
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') !== activeTab) {
            params.set('tab', activeTab);
            window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
    }, [activeTab]);

    const [dbUserId, setDbUserId] = useState<string | null>(null);

    // Fetch User Settings at top level to share proxyAddress
    const { data: settings } = useUserSettings(dbUserId || '');
    const proxyAddress = (settings as any)?.proxyAddress;

    useEffect(() => {
        if (connected && publicKey) {
            // console.log("App: Logging in user", publicKey.toBase58());
            loginUser(publicKey.toBase58());
        } else {
            setDbUserId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, publicKey]);

    // React Query Mutation
    const loginMutation = useLoginUser();

    const loginUser = async (walletAddress: string) => {
        try {
            // console.log("App: Logging in with address:", walletAddress);

            const data = await loginMutation.mutateAsync(walletAddress);

            if (data.success) {
                // console.log("App: Logged in, DB ID:", data.user.id);
                setDbUserId(data.user.id);
            }
        } catch (err) {
            console.error("Failed to login user", err);
        }
    }

    // Render content based on active tab
    const renderContent = () => {
        if (!connected) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="p-6 bg-blue-500/10 rounded-full ring-1 ring-blue-500/30 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]">
                        <div className="p-4 bg-blue-500/20 rounded-full">
                            <Zap size={48} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
                        <p className="text-gray-400 max-w-md">
                            Access your autonomous trading agents, view real-time stats, and manage your portfolio.
                        </p>
                    </div>
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 flex items-center gap-2">
                        <span>Please click</span>
                        <div className="scale-75 origin-center">
                            <WalletMultiButton />
                        </div>
                        <span>in the top right</span>
                    </div>
                </div>
            );
        }

        // HARD GATE: If user is logged in but has no proxy credential, FORCE Settings (Onboarding)
        if (connected && dbUserId && !proxyAddress && activeTab !== 'settings') {
            return (
                <div className="max-w-4xl mx-auto pt-10">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 animate-pulse">
                            <Zap size={32} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Setup</h2>
                        <p className="text-gray-400">Import your Polymarket Credentials to enable autonomous trading.</p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-2 px-4 rounded-full border border-emerald-500/20 max-w-fit mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span className="text-sm font-medium">End-to-End Encrypted & Secure Storage</span>
                        </div>
                    </div>
                    <UserSettings dbUserId={dbUserId} />
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="">


                        {/* Stats Overview */}
                        <div className="mb-5">
                            <h3 className="text-xl font-bold text-white -mb-4">Stats Overview</h3>
                            <DashboardStats userId={dbUserId} />
                        </div>

                        {/* Wallet Control (Deposit/Withdraw) removed as requested */}

                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {/* Compact Agent View */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Deployed Agents</h3>
                                <AgentControl dbUserId={dbUserId} variant="compact" />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => setActiveTab('agents')}
                                        className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors flex items-center gap-1"
                                    >
                                        Show More &rarr;
                                    </button>
                                </div>
                            </div>
                            <GlobalActivityFeed userId={dbUserId} />
                        </div>
                    </div>
                );
            case 'agents':
                return <AgentControl dbUserId={dbUserId} />;
            case 'markets':
                return <MarketExplorer />;
            case 'wallet':
                return <Portfolio userId={dbUserId} />;
            case 'settings':
                return <UserSettings dbUserId={dbUserId || ''} />;
            default:
                return <div>Not found</div>;
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Toaster position="top-right" theme="dark" toastOptions={{ duration: 5000 }} />
            {renderContent()}
        </Layout>
    )
}

export default Dashboard
