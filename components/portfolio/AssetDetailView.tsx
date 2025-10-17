import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { getAssetDetails } from '../../utils/marketData';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { StockDetails, MutualFundDetails, PortfolioAsset, WatchlistItem, MarketData, AssetDetails } from '../../types';

interface AssetDetailViewProps {
    asset: PortfolioAsset | WatchlistItem;
    marketData: MarketData | undefined;
    onBack: () => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="label font-semibold text-xs">{new Date(label).toLocaleDateString()}</p>
                <p className="intro text-primary dark:text-primary-dark text-sm">{`Value: ₹${payload[0].value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</p>
            </div>
        );
    }
    return null;
};

const AssetDetailView: React.FC<AssetDetailViewProps> = ({ asset, marketData, onBack }) => {
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState('1Y');
    const [details, setDetails] = useState<AssetDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const fetchedDetails = await getAssetDetails(asset.id, asset.type);
            setDetails(fetchedDetails);
            setIsLoading(false);
        };
        fetchDetails();
    }, [asset]);

    if (isLoading) {
        return <div className="text-center py-20">Loading asset details...</div>;
    }

    if (!details || !marketData) {
        return (
            <div className="text-center py-20">
                <p>Could not load asset details.</p>
                <button onClick={onBack} className="mt-4 text-primary-light dark:text-primary-dark">Go Back</button>
            </div>
        );
    }
    
    const isProfit = marketData.dayChange >= 0;
    const chartData = details.chartData[timeRange];

    const colors = {
        light: { stroke: isProfit ? '#10b981' : '#ef4444', fill: isProfit ? 'url(#colorProfit)' : 'url(#colorLoss)' },
        dark: { stroke: isProfit ? '#34d399' : '#f87171', fill: isProfit ? 'url(#colorProfitDark)' : 'url(#colorLossDark)' },
    };
    const currentColors = theme === 'light' ? colors.light : colors.dark;

    const renderStockDetails = (d: StockDetails) => (
        <>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Market Cap</p>
                <p className="font-semibold">₹{(d.marketCap / 10000000).toFixed(2)} Cr</p>
            </div>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">P/E Ratio</p>
                <p className="font-semibold">{d.peRatio.toFixed(2)}</p>
            </div>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Sector</p>
                <p className="font-semibold">{d.sector}</p>
            </div>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg col-span-full">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">52-Week Range</p>
                 <div className="flex items-center justify-center mt-1">
                    <span className="text-sm font-semibold text-red-500">₹{d.week52Low.toFixed(2)}</span>
                    <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-2">
                         <div className="h-1.5 bg-gradient-to-r from-red-400 to-green-400 rounded-full" />
                    </div>
                    <span className="text-sm font-semibold text-green-500">₹{d.week52High.toFixed(2)}</span>
                </div>
            </div>
        </>
    );

     const renderMfDetails = (d: MutualFundDetails) => (
        <>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">NAV</p>
                <p className="font-semibold">₹{d.nav.toFixed(4)}</p>
            </div>
             <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">AUM (Cr)</p>
                <p className="font-semibold">{d.aum > 0 ? `₹${d.aum.toLocaleString('en-IN')}`: 'N/A'}</p>
            </div>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Expense Ratio</p>
                <p className="font-semibold">{d.expenseRatio > 0 ? `${d.expenseRatio.toFixed(2)}%` : 'N/A'}</p>
            </div>
            <div className="p-3 text-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Category</p>
                <p className="font-semibold">{d.category}</p>
            </div>
        </>
    );

    return (
        <div>
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-text-primary-light dark:text-text-primary-dark bg-slate-500/10 hover:bg-slate-500/20 transition-colors"
                >
                    <Icon name="arrowLeft" className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{details.name}</h2>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{details.type === 'STOCK' ? 'Stock' : 'Mutual Fund'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <p className="text-3xl font-bold">₹{marketData.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className={`flex items-center text-lg font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                             <Icon name={isProfit ? 'stockUp' : 'stockDown'} className="w-5 h-5 mr-1" />
                            <span>{marketData.dayChange.toFixed(2)} ({marketData.dayChangePercent.toFixed(2)}%) Today</span>
                        </div>
                    </Card>
                     <Card>
                        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {details.type === 'STOCK' ? renderStockDetails(details as StockDetails) : renderMfDetails(details as MutualFundDetails)}
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Performance</h3>
                        <div className="flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-xs">
                           {['1M', '6M', '1Y', '5Y'].map(range => (
                               <button key={range} onClick={() => setTimeRange(range)} className={`px-2 py-1 rounded ${timeRange === range ? 'bg-white dark:bg-slate-700' : ''}`}>{range}</button>
                           ))}
                        </div>
                    </div>
                     <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                 <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorProfitDark" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorLossDark" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tick={{ fontSize: 10 }} />
                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={currentColors.stroke} fill={currentColors.fill} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default AssetDetailView;