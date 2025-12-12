import type { ReactNode } from 'react';

interface LargeCardProps {
    title: string;
    description: string;
    action?: string;
    gradient: string;
    icon: ReactNode;
}

export function LargeCard({ title, description, gradient, icon }: LargeCardProps) {
    return (
        <div className={`p-10 rounded-3xl border border-white/10 relative overflow-hidden group ${gradient}`}>
            <div className="relative z-10">
                {icon}
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-gray-300 mb-8 leading-relaxed max-w-md">
                    {description}
                </p>
                {/* <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-md border border-white/5">
                    {action}
                </button> */}
            </div>
            {/* Hover Glare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500" />
        </div>
    );
}
