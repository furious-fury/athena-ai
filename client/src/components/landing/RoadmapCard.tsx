interface RoadmapCardProps {
    phase: string;
    time: string;
    title: string;
    status: 'active' | 'upcoming';
    items: string[];
}

export function RoadmapCard({ phase, time, title, status, items }: RoadmapCardProps) {
    const isActive = status === 'active';
    return (
        <div className={`relative z-10 p-8 rounded-2xl border h-full ${isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'} backdrop-blur-md`}>
            <div className={`absolute -top-4 left-8 px-4 py-1 rounded-full text-xs font-bold border ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/10 border-white/10 text-gray-400'}`}>
                {phase} • {time}
            </div>

            <h3 className={`text-xl font-bold mb-6 mt-2 ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</h3>

            <ul className="space-y-3">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-600'}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
