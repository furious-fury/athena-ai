import { useMemo } from 'react';
import Chart from './Chart'

import ActivePositions from './ActivePositions'
import { useProxyWallet, useUserPositions, usePortfolioHistory } from '../lib/api'

interface PortfolioProps {
    userId: string | null;
}

function Portfolio({ userId }: PortfolioProps) {
    const { data: proxyWallet, isLoading: walletLoading } = useProxyWallet(userId || "");
    const { data: positions, isLoading: positionsLoading } = useUserPositions(userId || "");
    const { data: history } = usePortfolioHistory(userId || "");

    const balanceNum = proxyWallet?.balance || 0;
    const balanceFormatted = balanceNum.toFixed(2);
    const proxyAddress = proxyWallet?.address;

    // Calculate Active Positions Value
    const { activeValueNum, activePositionsCount } = useMemo(() => {
        if (!positions || positions.length === 0) return { activeValueNum: 0, activePositionsCount: 0 };

        const totalValue = positions.reduce((acc: number, pos: any) => {
            return acc + (Number(pos.exposure) || 0);
        }, 0);

        return {
            activeValueNum: totalValue,
            activePositionsCount: positions.length
        };
    }, [positions]);

    const totalNetWorth = balanceNum + activeValueNum;
    const totalNetWorthFormatted = totalNetWorth.toFixed(2);

    // Prevent division by zero
    const cashPercent = totalNetWorth > 0 ? (balanceNum / totalNetWorth) * 100 : (balanceNum > 0 ? 100 : 0);
    const activePercent = totalNetWorth > 0 ? (activeValueNum / totalNetWorth) * 100 : 0;

    const isLoading = walletLoading || positionsLoading;

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
                            {isLoading ? "..." : `$${totalNetWorthFormatted}`}
                        </span>
                        {/* <span className="text-emerald-400 text-sm font-medium flex items-center bg-emerald-400/10 px-2 py-1 rounded-full">
                            +2.4% 
                        </span> */}
                    </div>

                    <div className="mt-8">
                        {proxyAddress ? (
                            <div className="text-sm text-gray-400">
                                Proxy: <span className="font-mono text-white/50">{proxyAddress.slice(0, 6)}...{proxyAddress.slice(-4)}</span>
                            </div>
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
                            <p className="text-2xl font-bold text-white mt-1">{walletLoading ? "..." : `$${balanceFormatted}`}</p>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${cashPercent}%` }} />
                        </div>
                        <p className="text-xs text-text-secondary mt-2">{cashPercent.toFixed(0)}% of portfolio</p>
                    </div>

                    <div className="bg-panel p-6 rounded-xl border border-transparent flex flex-col justify-between">
                        <div>
                            <p className="text-text-secondary text-xs uppercase font-bold tracking-wider">Active Positions</p>
                            <p className="text-2xl font-bold text-white mt-1">${activeValueNum.toFixed(2)}</p>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${activePercent}%` }} />
                        </div>
                        <p className="text-xs text-text-secondary mt-2">{activePositionsCount} active bets</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section - Takes up full width now */}
                <div className="lg:col-span-3">
                    <Chart data={history || []} className="h-[350px]" />
                </div>
            </div>

            {/* Active Positions Table */}
            <div>
                <ActivePositions userId={userId} className="h-[600px]" />
            </div>
        </div>
    )
}

export default Portfolio