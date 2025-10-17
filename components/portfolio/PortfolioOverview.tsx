import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../ui/Card';
import AnimatedCounter from '../ui/AnimatedCounter';
import { useTheme } from '../../hooks/useTheme';
import { PortfolioAsset, StockAsset, MarketData } from '../../types';

interface PortfolioOverviewProps {
    portfolio: PortfolioAsset[];
    marketData: Record<string, MarketData>;
}

const CustomPieTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value, payload: itemPayload } = payload[0];
        const percent = itemPayload.percent;
        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg text-sm">
                <p className="font-semibold">{name}</p>
                <p>Value: ₹{value.toLocaleString('en-IN')}</p>
                <p>Allocation: {percent.toFixed(2)}%</p>
            </div>
        );
    }
    return null;
};

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio, marketData }) => {
    const { theme } = useTheme();

    const summary = useMemo(() => {
        return portfolio.reduce((acc, asset) => {
            const assetMarketData = marketData[asset.id];
            if (assetMarketData) {
                const invested = asset.quantity * asset.avgPrice;
                const current = asset.quantity * assetMarketData.currentPrice;
                acc.totalInvestment += invested;
                acc.currentValue += current;
                acc.dayPnl += asset.quantity * assetMarketData.dayChange;
            }
            return acc;
        }, { totalInvestment: 0, currentValue: 0, dayPnl: 0 });
    }, [portfolio, marketData]);

    const totalPnl = summary.currentValue - summary.totalInvestment;
    const totalPnlPercent = summary.totalInvestment > 0 ? (totalPnl / summary.totalInvestment) * 100 : 0;
    const dayPnlPercent = summary.currentValue > 0 ? (summary.dayPnl / (summary.currentValue - summary.dayPnl)) * 100 : 0;
    
    const allocationData = useMemo(() => {
        const data = portfolio.reduce((acc, asset) => {
            const assetMarketData = marketData[asset.id];
            if(!assetMarketData) return acc;

            const currentVal = asset.quantity * assetMarketData.currentPrice;
            const key = asset.type === 'STOCK' ? 'Stocks' : 'Mutual Funds';
            acc[key] = (acc[key] || 0) + currentVal;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(data).map(([name, value]) => ({ name, value, percent: (value / summary.currentValue) * 100 }));
    }, [portfolio, marketData, summary.currentValue]);

    const sectorData = useMemo(() => {
        const stocks = portfolio.filter(a => a.type === 'STOCK') as StockAsset[];
        const data = stocks.reduce((acc, asset) => {
            const assetMarketData = marketData[asset.id];
             if(!assetMarketData) return acc;
            
            const currentVal = asset.quantity * assetMarketData.currentPrice;
            acc[asset.sector] = (acc[asset.sector] || 0) + currentVal;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(data).map(([name, value]) => ({ name, value, percent: (value / summary.currentValue) * 100 }));
    }, [portfolio, marketData, summary.currentValue]);

    const COLORS_ALLOCATION = theme === 'light' ? ['#4f46e5', '#10b981'] : ['#6366f1', '#34d399'];
    const COLORS_SECTOR = theme === 'light' 
        ? ['#818cf8', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'] 
        : ['#a5b4fc', '#fbbf24', '#6ee7b7', '#60a5fa', '#f9a8d4'];

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                     <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Current Value</p>
                        <AnimatedCounter value={summary.currentValue} className="text-xl md:text-2xl font-bold" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Invested</p>
                        <p className="text-xl md:text-2xl font-bold">₹{summary.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                     <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Overall P/L</p>
                        <p className={`text-xl md:text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            <span className="text-sm"> ({totalPnlPercent.toFixed(1)}%)</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Day's P/L</p>
                        <p className={`text-xl md:text-2xl font-bold ${summary.dayPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {summary.dayPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                           <span className="text-sm"> ({dayPnlPercent.toFixed(1)}%)</span>
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-center">Asset Allocation</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5}>
                                    {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_ALLOCATION[index % COLORS_ALLOCATION.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold mb-4 text-center">Sector Allocation</h3>
                     <div className="h-48 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5}>
                                    {sectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_SECTOR[index % COLORS_SECTOR.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PortfolioOverview;