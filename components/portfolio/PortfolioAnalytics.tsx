import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { PortfolioHistoryPoint } from '../../types';

interface PortfolioAnalyticsProps {
    history: PortfolioHistoryPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg text-sm">
                <p className="label font-semibold">{new Date(label).toLocaleDateString('en-IN')}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name}: ₹{p.value.toLocaleString('en-IN')}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ history }) => {
    const { theme } = useTheme();

    const colors = {
        light: { value: '#4f46e5', invested: '#64748b', grid: '#e2e8f0', tick: '#64748b' },
        dark: { value: '#6366f1', invested: '#94a3b8', grid: '#334155', tick: '#94a3b8' }
    };
    const currentColors = theme === 'light' ? colors.light : colors.dark;

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-1">Portfolio Growth</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6 text-sm">
                Track the historical performance of your investments over time.
            </p>
            <div className="h-96 w-full">
                <ResponsiveContainer>
                    <AreaChart data={history} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentColors.value} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={currentColors.value} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={date => new Date(date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })} 
                            stroke={currentColors.tick} 
                            tick={{ fontSize: 12 }} 
                        />
                        <YAxis 
                            tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} 
                            stroke={currentColors.tick}
                            tick={{ fontSize: 12 }}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Area 
                            type="monotone" 
                            dataKey="invested" 
                            stroke={currentColors.invested} 
                            fill="transparent" 
                            strokeWidth={2}
                            name="Invested Amount"
                            strokeDasharray="5 5"
                        />
                         <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={currentColors.value} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            strokeWidth={2}
                            name="Current Value"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default PortfolioAnalytics;