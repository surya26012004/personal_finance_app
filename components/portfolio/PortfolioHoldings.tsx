import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioAsset, WatchlistItem, MarketData } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface AssetCardProps {
    asset: PortfolioAsset | WatchlistItem;
    marketData?: MarketData;
    onSelect: (asset: PortfolioAsset | WatchlistItem) => void;
    onEdit?: (asset: PortfolioAsset) => void;
    onDelete?: (id: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, marketData, onSelect, onEdit, onDelete }) => {
    const isPortfolioAsset = 'quantity' in asset;
    
    const investedValue = isPortfolioAsset ? asset.quantity * asset.avgPrice : 0;
    const currentValue = isPortfolioAsset && marketData ? asset.quantity * marketData.currentPrice : 0;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    const isProfit = marketData ? marketData.dayChange >= 0 : true;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(asset)}
            className="cursor-pointer group relative"
        >
            <Card className="!p-4 hover:border-primary-light/50 dark:hover:border-primary-dark/50">
                 {marketData ? (
                    <>
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0 pr-16">
                                <p className="text-sm font-bold truncate text-text-primary-light dark:text-text-primary-dark">{asset.name}</p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                    {isPortfolioAsset ? `${asset.quantity.toLocaleString()} units @ ₹${asset.avgPrice.toFixed(2)}` : asset.type.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="text-right ml-2 w-28">
                                <p className="font-semibold text-sm">₹{marketData.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <div className={`flex items-center justify-end text-xs ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                    <Icon name={isProfit ? 'stockUp' : 'stockDown'} className="w-3 h-3 mr-1" />
                                    <span>{marketData.dayChange.toFixed(2)} ({marketData.dayChangePercent.toFixed(2)}%)</span>
                                </div>
                            </div>
                        </div>
                        {isPortfolioAsset && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-3 text-xs text-center">
                                <div>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Invested</p>
                                    <p>₹{investedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                </div>
                                 <div>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Current</p>
                                    <p>₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">P/L</p>
                                    <p className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pnlPercent.toFixed(1)}%)
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                     <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold truncate text-text-primary-light dark:text-text-primary-dark">{asset.name}</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Loading market data...</p>
                        </div>
                        <div className="animate-pulse h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                )}
            </Card>
            {isPortfolioAsset && (
                 <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(asset as PortfolioAsset); }} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"><Icon name="pencil" className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(asset.id); }} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500/20 text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                </div>
            )}
        </motion.div>
    );
};


interface PortfolioHoldingsProps {
    portfolio: (PortfolioAsset | WatchlistItem)[];
    marketData: Record<string, MarketData>;
    onSelectAsset: (asset: PortfolioAsset | WatchlistItem) => void;
    isWatchlist?: boolean;
    onAddAsset?: () => void;
    onEditAsset?: (asset: PortfolioAsset) => void;
    onDeleteAsset?: (id: string) => void;
}

const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ portfolio, marketData, onSelectAsset, isWatchlist = false, onAddAsset, onEditAsset, onDeleteAsset }) => {
    
    const { stocks, mutualFunds } = useMemo(() => {
        const stocks: (PortfolioAsset | WatchlistItem)[] = [];
        const mutualFunds: (PortfolioAsset | WatchlistItem)[] = [];
        
        portfolio.forEach(asset => {
            if (asset.type === 'STOCK') stocks.push(asset);
            else mutualFunds.push(asset);
        });
        
        return { stocks, mutualFunds };
    }, [portfolio]);

    const renderAssetList = (assets: (PortfolioAsset | WatchlistItem)[]) => (
        <AnimatePresence>
            {assets.map(asset => (
                <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    marketData={marketData[asset.id]} 
                    onSelect={onSelectAsset}
                    onEdit={onEditAsset}
                    onDelete={onDeleteAsset}
                />
            ))}
        </AnimatePresence>
    );

    return (
        <div className="space-y-4">
            {!isWatchlist && (
                 <div className="flex justify-end">
                    <button
                        onClick={onAddAsset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-light dark:bg-primary-dark rounded-full hover:bg-opacity-90 transition-colors shadow-lg"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        Add Asset
                    </button>
                </div>
            )}
           
            {isWatchlist ? (
                renderAssetList(portfolio)
            ) : (
                <>
                    <div>
                        <h3 className="text-lg font-semibold mb-2 pl-2">Stocks ({stocks.length})</h3>
                        {stocks.length > 0 ? (
                            <div className="space-y-3">{renderAssetList(stocks)}</div>
                        ) : (
                            <p className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">No stocks added yet.</p>
                        )}
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2 mt-4 pl-2">Mutual Funds ({mutualFunds.length})</h3>
                        {mutualFunds.length > 0 ? (
                            <div className="space-y-3">{renderAssetList(mutualFunds)}</div>
                        ) : (
                            <p className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark">No mutual funds added yet.</p>
                        )}
                    </div>
                </>
            )}

            {portfolio.length === 0 && !isWatchlist && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Your portfolio is empty.</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Click "Add Asset" to get started.</p>
                </motion.div>
            )}

             {portfolio.length === 0 && isWatchlist && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Your watchlist is empty.</p>
                </motion.div>
            )}
        </div>
    );
};

export default PortfolioHoldings;