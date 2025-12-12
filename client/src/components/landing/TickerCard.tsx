import type { ReactNode } from 'react';

interface TickerCardProps {
    icon: ReactNode;
    label: string;
    value: string;
    trend: string;
}

export function TickerCard({ icon, label, value, trend }: TickerCardProps) {
    return (
        <div className="bg-panel border border-white/10 p-6 rounded-2xl shadow-xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
                <p className="text-gray-400 text-sm mb-1">{label}</p>
                <h4 className="text-2xl font-bold text-white">{value}</h4>
                <p className="text-xs text-green-400 mt-1">{trend}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
                {icon}
            </div>
        </div>
    );
}
