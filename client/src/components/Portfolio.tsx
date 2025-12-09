import Chart from './Chart'
import TransactionHistory from './TransactionHistory'
import ActivePositions from './ActivePositions'
import { useProxyWallet } from '../lib/api'
import WalletControl from './WalletControl'
import { useProxyUSDCBalance } from '../hooks/useProxyUSDCBalance'

interface PortfolioProps {
    userId: string | null;
}

function Portfolio({ userId }: PortfolioProps) {
    const { data: proxyWallet, isLoading } = useProxyWallet(userId || "");
    const { formatted: balanceFormatted, balance: balanceNum } = useProxyUSDCBalance(userId);
    const proxyAddress = proxyWallet?.address;

    const activeValueNum = 0; // Placeholder until we have real position values
    const totalValue = balanceNum + activeValueNum;

    const cashPercent = totalValue > 0 ? (balanceNum / totalValue) * 100 : 0;
    const activePercent = totalValue > 0 ? (activeValueNum / totalValue) * 100 : 0;

    return (

        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Net Worth Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Balance Card */}
                <div className="bg-linear-to-br from-panel to-black/40 p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </div>

                    <h2 className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-2">Total Net Worth</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white tracking-tight">
                            {isLoading ? "..." : `$${balanceFormatted}`}
                        </span>
                        {/* <span className="text-emerald-400 text-sm font-medium flex items-center bg-emerald-400/10 px-2 py-1 rounded-full">
                            +2.4% 
                        </span> */}
                    </div>

                    <div className="mt-8">
                        {proxyAddress ? (
                            <WalletControl userId={userId} proxyAddress={proxyAddress} className="flex gap-3" />
                        ) : (
                            <div className="text-sm text-gray-500 italic">Initializing wallet...</div>
                        )}
                    </div>
                </div>

                {/* Secondary Stat Cards */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-panel p-6 rounded-xl border border-transparent flex flex-col justify-between">
                        <div>
                            <p className="text-text-secondary text-xs uppercase font-bold tracking-wider">Cash Balance</p>
                            <p className="text-2xl font-bold text-white mt-1">{isLoading ? "..." : `$${balanceFormatted}`}</p>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${cashPercent}%` }} />
                        </div>
                        <p className="text-xs text-text-secondary mt-2">{cashPercent.toFixed(0)}% of portfolio</p>
                    </div>

                    <div className="bg-panel p-6 rounded-xl border border-transparent flex flex-col justify-between">
                        <div>
                            <p className="text-text-secondary text-xs uppercase font-bold tracking-wider">Active Positions</p>
                            <p className="text-2xl font-bold text-white mt-1">$0.00</p>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${activePercent}%` }} />
                        </div>
                        <p className="text-xs text-text-secondary mt-2">0 active bets</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <Chart className="h-[450px]" />
                </div>

                {/* Transactions Feed - Takes up 1 column */}
                <div className="lg:col-span-1">
                    <TransactionHistory userId={userId} className="h-[450px]" />
                </div>
            </div>

            {/* Active Positions Table */}
            <div>
                <ActivePositions userId={userId} className="h-[450px]" />
            </div>
        </div>
    )
}

export default Portfolio