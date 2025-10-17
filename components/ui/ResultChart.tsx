
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface ChartData {
    year: number;
    value: number;
}

interface ResultChartProps {
    data: ChartData[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="label font-semibold">{`Year ${label}`}</p>
                <p className="intro text-primary dark:text-primary-dark">{`Value: ₹${payload[0].value.toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                })}`}</p>
            </div>
        );
    }
    return null;
};


const ResultChart: React.FC<ResultChartProps> = ({ data }) => {
    const { theme } = useTheme();

    const colors = {
        light: {
            stroke: '#4f46e5',
            fill: 'url(#colorValue)',
            grid: '#e2e8f0',
            tick: '#64748b'
        },
        dark: {
            stroke: '#6366f1',
            fill: 'url(#colorValueDark)',
            grid: '#334155',
            tick: '#94a3b8'
        }
    }

    const currentColors = theme === 'light' ? colors.light : colors.dark;

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorValueDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke={currentColors.tick} tick={{ fontSize: 12 }} />
                    <YAxis 
                        tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} 
                        stroke={currentColors.tick}
                        tick={{ fontSize: 12 }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke={currentColors.grid} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={currentColors.stroke} fill={currentColors.fill} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ResultChart;
