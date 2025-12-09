import { useAgents } from "../lib/api";
import { Wallet, Activity, TrendingUp, Cpu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProxyUSDCBalance } from "../hooks/useProxyUSDCBalance";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subValue?: string;
    subColor?: string;
    loading?: boolean;
}

function StatCard({ title, value, icon: Icon, subValue, subColor = "text-green-500", loading }: StatCardProps) {
    return (
        <div className="bg-panel shadow-accent shadow-2xl rounded-xl p-5 hover:border-accent/30 transition-all duration-300 group my-8">
            <div className="flex justify-between items-start my-4">
                <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                </div>
                {subValue && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded bg-black/30 ${subColor}`}>
                        {subValue}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
                {loading ? (
                    <Skeleton className="h-8 w-24 bg-muted" />
                ) : (
                    <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
                )}
            </div>
        </div>
    );
}

export default function DashboardStats({ userId }: { userId: string | null }) {
    const { data: agents, isLoading: agentsLoading } = useAgents();
    // const { data: proxyWallet } = useProxyWallet(userId || ""); // Unused now
    const { formatted: balance, isLoading: balanceLoading } = useProxyUSDCBalance(userId);

    // Derived Stats
    const totalAgents = agents?.length || 0;
    const runningJobs = agents?.filter((a: any) => a.isRunning).length || 0;

    const dailyPnL = "$0.00"; // Placeholder: user asked for PnL but backend calc is needed.

    if (!userId) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 bg-panel/50 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Cash Balance"
                value={`$${balance}`}
                icon={Wallet}
                loading={balanceLoading}
                subValue="USDC"
            />
            <StatCard
                title="Active Agents"
                value={totalAgents}
                icon={Cpu}
                loading={agentsLoading}
            />
            <StatCard
                title="PnL"
                value={dailyPnL}
                icon={TrendingUp}
                loading={false}
                subValue="Coming Soon"
                subColor="text-gray-500"
            />
            <StatCard
                title="Running Jobs"
                value={runningJobs}
                icon={Activity}
                loading={agentsLoading}
                subColor="text-blue-400"
                subValue={runningJobs > 0 ? "Active" : "Idle"}
            />
        </div>
    );
}
