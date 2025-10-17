import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getMarketData } from '../../utils/marketData';
import { PortfolioAsset, WatchlistItem, MarketData, AssetDetails } from '../../types';
import AssetDetailView from './AssetDetailView';
import PortfolioOverview from './PortfolioOverview';
import PortfolioHoldings from './PortfolioHoldings';
import AssetForm from './AssetForm';
import { Icon, IconName } from '../ui/Icon';
import { Card } from '../ui/Card';

type TabId = 'overview' | 'holdings' | 'watchlist';

interface TabItem {
    id: TabId;
    label: string;
    icon: IconName;
}

const TABS: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'holdings', label: 'Holdings', icon: 'holdings' },
    { id: 'watchlist', label: 'Watchlist', icon: 'watchlist' },
];

const PortfolioTracker: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | WatchlistItem | null>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean, assetToEdit?: PortfolioAsset | null }>({ isOpen: false });

    const [portfolio, setPortfolio] = useLocalStorage<PortfolioAsset[]>('portfolio-data', []);
    const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>('watchlist-data', []);
    
    const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [detailsCache, setDetailsCache] = useState<Record<string, AssetDetails>>({});

    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoading(true);
            const allAssets = [...portfolio, ...watchlist];
            if (allAssets.length > 0) {
                const data = await getMarketData(allAssets);
                setMarketData(data);
            }
            setIsLoading(false);
        };
        fetchMarketData();
    }, [portfolio, watchlist]);

    const updateDetailsCache = useCallback((assetId: string, details: AssetDetails) => {
        setDetailsCache(prev => ({ ...prev, [assetId]: details }));
    }, []);

    const handleSelectAsset = useCallback((asset: PortfolioAsset | WatchlistItem) => setSelectedAsset(asset), []);
    const handleBack = useCallback(() => setSelectedAsset(null), []);

    const handleOpenModal = (asset?: PortfolioAsset) => setModalState({ isOpen: true, assetToEdit: asset });
    const handleCloseModal = () => setModalState({ isOpen: false });

    const handleSaveAsset = (asset: PortfolioAsset) => {
        setPortfolio(prev => {
            const existing = prev.find(a => a.id === asset.id);
            if (existing) {
                return prev.map(a => a.id === asset.id ? asset : a);
            }
            return [...prev, asset];
        });
        handleCloseModal();
    };

    const handleDeleteAsset = (assetId: string) => {
        setPortfolio(prev => prev.filter(a => a.id !== assetId));
    };

    const pageVariants: Variants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center py-10">Loading market data...</div>;
        }
        switch (activeTab) {
            case 'overview':
                return <PortfolioOverview portfolio={portfolio} marketData={marketData} />;
            case 'holdings':
                return <PortfolioHoldings 
                            portfolio={portfolio} 
                            marketData={marketData} 
                            onSelectAsset={handleSelectAsset}
                            onEditAsset={handleOpenModal}
                            onDeleteAsset={handleDeleteAsset}
                            onAddAsset={() => handleOpenModal()}
                        />;
            case 'watchlist':
                 return <PortfolioHoldings portfolio={watchlist} marketData={marketData} onSelectAsset={handleSelectAsset} isWatchlist />;
            default:
                return null;
        }
    };

    return (
        <>
            <AnimatePresence>
                {modalState.isOpen && (
                    <AssetForm
                        isOpen={modalState.isOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveAsset}
                        assetToEdit={modalState.assetToEdit}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {selectedAsset ? (
                    <motion.div key="detail" initial="hidden" animate="visible" exit="exit" variants={pageVariants}>
                        <AssetDetailView 
                            asset={selectedAsset} 
                            marketData={marketData[selectedAsset.id]} 
                            onBack={handleBack} 
                            cache={detailsCache}
                            onCacheUpdate={updateDetailsCache}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="list" initial="hidden" animate="visible" exit="exit" variants={pageVariants}>
                        <h2 className="text-3xl font-bold text-center mb-2">My Investments</h2>
                        <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-8">
                            Your comprehensive dashboard for stocks & mutual funds.
                        </p>

                        <div className="flex justify-center mb-8">
                            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-full space-x-1">
                                {TABS.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`relative px-3 sm:px-4 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${
                                            activeTab === item.id ? 'text-primary-light dark:text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                                        }`}
                                    >
                                        {activeTab === item.id && (
                                            <motion.div
                                                layoutId="active-portfolio-tab"
                                                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full z-0"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10"><Icon name={item.icon} className="w-4 h-4" /></span>
                                        <span className="relative z-10 hidden sm:inline">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PortfolioTracker;