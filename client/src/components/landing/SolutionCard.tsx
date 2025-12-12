import type { ReactNode } from 'react';

interface SolutionCardProps {
    icon: ReactNode;
    title: string;
    desc: string;
}

export function SolutionCard({ icon, title, desc }: SolutionCardProps) {
    return (
        <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group">
            <div className="mb-4 text-blue-400 group-hover:text-white transition-colors">
                {icon}
            </div>
            <h4 className="font-bold text-white mb-2">{title}</h4>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    );
}
