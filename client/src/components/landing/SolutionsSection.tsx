import { Bot, Zap, Lock, TrendingUp, BarChart2, Cpu } from 'lucide-react';
import { SolutionCard } from './SolutionCard';

export function SolutionsSection() {
    return (
        <section className="py-24 bg-black/20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-transparent to-black/50 pointer-events-none" />

                    <div className="relative z-10 text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Complete Trading Solution</h2>
                        <p className="text-gray-400">Everything you need to dominate prediction markets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SolutionCard icon={<Bot />} title="Autonomous Agents" desc="Deploy agents that run 24/7 with auto-maintenance modes." />
                        <SolutionCard icon={<Zap />} title="Fast Execution" desc="On-chain trades via high-speed proxies to bypass congestion." />
                        <SolutionCard icon={<Lock />} title="Secure Enclave" desc="Per-user key isolation with AES-256 encryption." />
                        <SolutionCard icon={<TrendingUp />} title="Risk Controls" desc="Automated Stop-Loss, Take-Profit, and Exposure Limits." />
                        <SolutionCard icon={<BarChart2 />} title="Live Analytics" desc="Real-time performance tracking and decision logging." />
                        <SolutionCard icon={<Cpu />} title="LLM Analysis" desc="Custom LLM models trained for complex market reasoning." />
                    </div>
                </div>
            </div>
        </section>
    );
}
