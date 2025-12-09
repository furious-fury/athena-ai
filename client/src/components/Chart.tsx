
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY_DATA = [
    { time: '00:00', value: 0 },
    { time: '04:00', value: 0 },
    { time: '08:00', value: 0 },
    { time: '12:00', value: 0 },
    { time: '16:00', value: 0 },
    { time: '20:00', value: 0 },
    { time: '23:59', value: 0 },
];

interface ChartProps {
    data?: { time: string; value: number }[];
    className?: string;
}

function Chart({ data, className }: ChartProps) {
    const chartData = data && data.length > 0 ? data : EMPTY_DATA;
    const isPositive = chartData[chartData.length - 1].value >= chartData[0].value;
    const change = data && data.length > 0 ? "+0.0%" : "0.0%"; // Placeholder logic

    return (
        <div className={`w-full bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col ${className || 'h-[400px]'}`}>
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-sm font-medium text-text-secondary">Performance (24h)</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                    }`}>
                    {change}
                </span>
            </div>

            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={['dataMin - 100', 'dataMax + 100']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                borderRadius: '8px',
                                color: '#fff',
                            }}
                            itemStyle={{ color: isPositive ? '#10b981' : '#ef4444' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Chart;