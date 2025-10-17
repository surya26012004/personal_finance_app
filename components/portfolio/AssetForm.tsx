import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioAsset, StockAsset, MutualFundAsset, AssetType, AssetSearchResult } from '../../types';
import { searchAssets } from '../../utils/marketData';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';

interface AssetFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: PortfolioAsset) => void;
    assetToEdit?: PortfolioAsset | null;
}

const emptyStock: Omit<StockAsset, 'sector'> = { id: '', type: 'STOCK', name: '', quantity: 0, avgPrice: 0 };
const emptyMf: Omit<MutualFundAsset, 'category'> = { id: '', type: 'MUTUAL_FUND', name: '', quantity: 0, avgPrice: 0 };

const AssetForm: React.FC<AssetFormProps> = ({ isOpen, onClose, onSave, assetToEdit }) => {
    const [assetType, setAssetType] = useState<AssetType>('STOCK');
    const [formData, setFormData] = useState<Partial<PortfolioAsset>>(assetToEdit || { ...emptyStock, sector: '' });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (assetToEdit) {
            setAssetType(assetToEdit.type);
            setFormData(assetToEdit);
            setSearchQuery(assetToEdit.name);
        } else {
            setAssetType('STOCK');
            setFormData({ ...emptyStock, sector: 'IT' });
            setSearchQuery('');
        }
        setSearchResults([]);
    }, [assetToEdit, isOpen]);

    // Debounced search effect
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchAssets(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
        }, 300); // 300ms debounce delay

        return () => clearTimeout(handler);
    }, [searchQuery]);


    const handleTypeChange = (type: AssetType) => {
        setAssetType(type);
        setSearchQuery('');
        setSearchResults([]);
        if (type === 'STOCK') {
            setFormData({ ...emptyStock, sector: 'IT' });
        } else {
            setFormData({ ...emptyMf, category: 'Equity' });
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchQuery(value);
        setFormData(prev => ({ ...prev, name: value }));
    };
    
    const handleSelectSearchResult = (result: AssetSearchResult) => {
        setFormData(prev => ({
            ...prev,
            id: result.id,
            name: result.name,
            type: result.type,
        }));
        setAssetType(result.type);
        setSearchQuery(result.name);
        setSearchResults([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'avgPrice'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id || !formData.name || !formData.quantity || formData.quantity <= 0 || !formData.avgPrice || formData.avgPrice <= 0) {
            alert('Please fill all required fields with valid values.');
            return;
        }
        onSave(formData as PortfolioAsset);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="!p-0">
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xl font-semibold">{assetToEdit ? 'Edit Asset' : 'Add New Asset'}</h3>
                                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <Icon name="close" className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <button type="button" onClick={() => handleTypeChange('STOCK')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${assetType === 'STOCK' ? 'bg-white dark:bg-slate-700 shadow' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Stock</button>
                                        <button type="button" onClick={() => handleTypeChange('MUTUAL_FUND')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${assetType === 'MUTUAL_FUND' ? 'bg-white dark:bg-slate-700 shadow' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Mutual Fund</button>
                                    </div>
                                    
                                    <div className="relative">
                                        <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Search Asset Name</label>
                                        <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="e.g., Reliance or Parag Parikh" className="w-full mt-1 p-2 rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark" required />
                                        {isSearching && <div className="absolute right-3 top-7 text-xs">Searching...</div>}
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {searchResults.map(result => (
                                                    <div key={result.id} onClick={() => handleSelectSearchResult(result)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm">
                                                        <p className="font-semibold">{result.name}</p>
                                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{result.id} - {result.type.replace('_', ' ')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Ticker / Scheme Code</label>
                                        <input type="text" name="id" value={formData.id || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-md bg-slate-200 dark:bg-slate-900 focus:outline-none cursor-not-allowed" readOnly />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Quantity / Units</label>
                                            <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} step="any" min="0" className="w-full mt-1 p-2 rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark" required />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Avg. Price / NAV</label>
                                            <input type="number" name="avgPrice" value={formData.avgPrice || ''} onChange={handleChange} step="any" min="0" className="w-full mt-1 p-2 rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark" required />
                                        </div>
                                    </div>
                                    
                                    {assetType === 'STOCK' ? (
                                        <div>
                                            <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Sector</label>
                                            <input type="text" name="sector" value={(formData as StockAsset).sector || ''} onChange={handleChange} placeholder="e.g., Financials" className="w-full mt-1 p-2 rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Category</label>
                                            <select name="category" value={(formData as MutualFundAsset).category || 'Equity'} onChange={handleChange} className="w-full mt-1 p-2 rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark appearance-none">
                                                <option>Equity</option>
                                                <option>Debt</option>
                                                <option>Hybrid</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-2xl">
                                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-opacity-90 transition-colors shadow-md">
                                        {assetToEdit ? 'Save Changes' : 'Add Asset'}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AssetForm;