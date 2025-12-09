import './App.css'
import './App.css'

import Layout from './components/Layout';
import Portfolio from './components/Portfolio';
import AgentControl from './components/AgentControl';
import MarketExplorer from './components/MarketExplorer';
import UserSettings from './components/UserSettings';



import { Toaster } from "sonner";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import GlobalActivityFeed from './components/GlobalActivityFeed';
import DashboardStats from './components/DashboardStats';
import { useUserSettings } from './lib/api';
import { ArrowRight, Zap } from 'lucide-react';
import WalletControl from './components/WalletControl';

// CTA Component for Dashboard
const TradingActivationCTA = ({ userId, proxyAddress, onNavigateSettings }: { userId: string | null, proxyAddress?: string, onNavigateSettings: () => void }) => {
  // If user has a proxy wallet (proxyAddress is set), don't show this CTA
  if (!userId || proxyAddress) return null;

  return (
    <div className="mb-8 p-6 rounded-xl bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 animate-pulse">
          <Zap size={24} fill="currentColor" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Activate Autonomous Trading</h3>
          <p className="text-sm text-gray-300">Initialize your dedicated proxy wallet to let agents trade 24/7.</p>
        </div>
      </div>
      <button
        onClick={onNavigateSettings}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
      >
        Initialize Wallet <ArrowRight size={16} />
      </button>
    </div>
  );
};


function App() {
  const { address, isConnected } = useAccount();

  // App Navigation State - Default to Dashboard
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'markets' | 'wallet' | 'settings'>('dashboard');

  const [dbUserId, setDbUserId] = useState<string | null>(null);

  // Fetch User Settings at top level to share proxyAddress
  const { data: settings } = useUserSettings(dbUserId || '');
  const proxyAddress = (settings as any)?.proxyAddress;

  useEffect(() => {
    if (isConnected && address) {
      // console.log("App: Logging in user", address);
      loginUser(address);
    } else {
      setDbUserId(null);
    }
  }, [isConnected, address]);

  const loginUser = async (walletAddress: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      });
      const data = await res.json();
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
    if (!isConnected) {
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
            <span className="font-bold text-white bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30">Connect Wallet</span>
            <span>in the top right</span>
          </div>
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

            {/* Wallet Control (Deposit/Withdraw) - Only if proxy initialized */}
            {proxyAddress && (
              <div className="mb-8">
                <WalletControl userId={dbUserId} proxyAddress={proxyAddress} />
              </div>
            )}

            {/* Trading Activation CTA */}
            <TradingActivationCTA
              userId={dbUserId}
              proxyAddress={proxyAddress}
              onNavigateSettings={() => setActiveTab('settings')}
            />


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

export default App
