import type {
    AssetDetails,
    AssetSearchResult,
    AssetType,
    MarketData,
    MutualFundDetails,
    PortfolioAsset,
    StockDetails,
    WatchlistItem
} from '../types';

// ===================================================================================
// LIVE DATA INTEGRATION - ACTION REQUIRED
// ===================================================================================
// 1. Replace the placeholders below with your actual API keys and URLs.
// 2. Update the `fetch` calls and data parsing logic to match your specific API documentation.
//
// IMPORTANT: For security, use environment variables in a real-world application
// instead of hardcoding keys directly in the source code.
// ===================================================================================

const UPSTOX_API_KEY = 'YOUR_UPSTOX_API_KEY';
const UPSTOX_API_BASE_URL = 'https://api.upstox.com/v2'; // Hypothetical URL

const MF_API_BASE_URL = 'https://api.mfapi.in'; // Real Free Mutual Fund API

// --- MOCK DATA (For Fallback) ---

// FIX: Add `id` to the type definition for MOCK_ASSETS values to match the object shape.
const MOCK_ASSETS: Record<string, (StockDetails | MutualFundDetails) & { id: string; name: string; type: AssetType; }> = {
    'RELIANCE': { id: 'RELIANCE', name: 'Reliance Industries Ltd', type: 'STOCK', marketCap: 20000000000000, peRatio: 28.5, week52High: 3024, week52Low: 2220, sector: 'Energy' },
    'HDFCBANK': { id: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'STOCK', marketCap: 12000000000000, peRatio: 20.1, week52High: 1757, week52Low: 1363, sector: 'Financials' },
    'TCS': { id: 'TCS', name: 'Tata Consultancy Services Ltd', type: 'STOCK', marketCap: 14000000000000, peRatio: 32.8, week52High: 4254, week52Low: 3070, sector: 'IT' },
    '120530': { id: '120530', name: 'Parag Parikh Flexi Cap Fund', type: 'MUTUAL_FUND', aum: 66000, expenseRatio: 0.65, nav: 76.5, category: 'Equity' },
    '119554': { id: '119554', name: 'Axis Bluechip Fund', type: 'MUTUAL_FUND', aum: 32000, expenseRatio: 0.55, nav: 57.2, category: 'Equity' },
};

const MOCK_MARKET_DATA: Record<string, MarketData> = {
    'RELIANCE': { currentPrice: 2950.75, dayChange: 25.40, dayChangePercent: 0.87 },
    'HDFCBANK': { currentPrice: 1680.20, dayChange: -10.15, dayChangePercent: -0.60 },
    'TCS': { currentPrice: 3850.00, dayChange: 42.10, dayChangePercent: 1.11 },
    '120530': { currentPrice: 76.5, dayChange: 0.35, dayChangePercent: 0.46 },
    '119554': { currentPrice: 57.2, dayChange: -0.12, dayChangePercent: -0.21 },
};


// --- API Functions ---

/**
 * Fetches real-time market data for a list of assets from their respective APIs.
 */
export const getMarketData = async (assets: (PortfolioAsset | WatchlistItem)[]): Promise<Record<string, MarketData>> => {
    const useMock = UPSTOX_API_KEY.startsWith('YOUR_');
    const assetIds = assets.map(a => a.id);

    if (useMock || assets.length === 0) {
        if (!useMock) console.warn("API Key not set. Falling back to MOCK market data.");
        return Object.fromEntries(Object.entries(MOCK_MARKET_DATA).filter(([key]) => assetIds.includes(key)));
    }

    const stockAssets = assets.filter(a => a.type === 'STOCK');
    const mfAssets = assets.filter(a => a.type === 'MUTUAL_FUND');
    const results: Record<string, MarketData> = {};

    try {
        // --- Fetch Stock Data from Upstox (Hypothetical) ---
        if (stockAssets.length > 0) {
            // NOTE: You would need to map your tickers (e.g., 'RELIANCE') to Upstox instrument_key.
            // This is a simplified example.
            const stockIds = stockAssets.map(a => `NSE_EQ|${a.id}`).join(',');
            const endpoint = `${UPSTOX_API_BASE_URL}/market/quotes?instrument_key=${stockIds}`;
            // const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${UPSTOX_API_KEY}` } });
            // const data = await response.json();
            // for (const key in data.data) {
            //     const quote = data.data[key];
            //     const ticker = key.split('|')[1];
            //     results[ticker] = {
            //         currentPrice: quote.last_price,
            //         dayChange: quote.change,
            //         dayChangePercent: (quote.change / (quote.last_price - quote.change)) * 100
            //     };
            // }
            // For demo, using mock data
            stockAssets.forEach(asset => {
                if (MOCK_MARKET_DATA[asset.id]) results[asset.id] = MOCK_MARKET_DATA[asset.id];
            })
        }

        // --- Fetch Mutual Fund NAVs from MF API ---
        if (mfAssets.length > 0) {
            const promises = mfAssets.map(async (asset) => {
                const endpoint = `${MF_API_BASE_URL}/mf/${asset.id}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                const todayNav = parseFloat(data.data[0].nav);
                const yesterdayNav = parseFloat(data.data[1].nav);
                const dayChange = todayNav - yesterdayNav;
                const dayChangePercent = (dayChange / yesterdayNav) * 100;
                results[asset.id] = {
                    currentPrice: todayNav,
                    dayChange: dayChange,
                    dayChangePercent: dayChangePercent
                };
            });
            await Promise.all(promises);
        }

        return results;
    } catch (error) {
        console.error("Failed to fetch live market data:", error);
        return {}; // Return empty on error
    }
};

/**
 * Fetches detailed information for a single asset.
 */
export const getAssetDetails = async (assetId: string, assetType: AssetType): Promise<AssetDetails | null> => {
    const useMock = UPSTOX_API_KEY.startsWith('YOUR_');
    if (useMock) {
        console.warn(`API Key not set. Falling back to MOCK asset details for ${assetId}.`);
        const assetInfo = MOCK_ASSETS[assetId];
        if (!assetInfo) return null;

        const marketData = MOCK_MARKET_DATA[assetId];
        const basePrice = marketData ? marketData.currentPrice : 1000;
        
        const generateChartData = (base: number) => {
            const data: { date: string, value: number }[] = [];
            let current = base;
            for (let i = 0; i < 365 * 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (365 * 5 - i));
                current *= 1 + (Math.random() - 0.49) * 0.02;
                data.push({ date: date.toISOString().split('T')[0], value: parseFloat(current.toFixed(2)) });
            }
            return { '1M': data.slice(-30), '6M': data.slice(-180), '1Y': data.slice(-365), '5Y': data };
        };

        return { ...assetInfo, chartData: generateChartData(basePrice) } as AssetDetails;
    }

    try {
        // --- LIVE API IMPLEMENTATION EXAMPLE ---
        let details: Partial<AssetDetails>;
        if (assetType === 'STOCK') {
            // Call Upstox API for profile, fundamentals, and historical chart data
            // const profileEndpoint = `${UPSTOX_API_BASE_URL}/instruments/NSE_EQ|${assetId}`;
            // ... fetch and parse data
            details = { ...MOCK_ASSETS[assetId] as StockDetails, type: 'STOCK' };
        } else { // MUTUAL_FUND
            // Call MF API for scheme details and historical NAV data
            const detailsEndpoint = `${MF_API_BASE_URL}/mf/${assetId}`;
            const [detailsResponse] = await Promise.all([fetch(detailsEndpoint)]);
            const detailsData = await detailsResponse.json();

            const chartPoints = detailsData.data.slice(0, 365 * 5).reverse();
             const chartData = {
                '1M': chartPoints.slice(-30).map((d: any) => ({ date: d.date, value: parseFloat(d.nav) })),
                '6M': chartPoints.slice(-180).map((d: any) => ({ date: d.date, value: parseFloat(d.nav) })),
                '1Y': chartPoints.slice(-365).map((d: any) => ({ date: d.date, value: parseFloat(d.nav) })),
                '5Y': chartPoints.map((d: any) => ({ date: d.date, value: parseFloat(d.nav) })),
            };

            details = {
                id: assetId,
                name: detailsData.meta.scheme_name,
                type: 'MUTUAL_FUND',
                nav: parseFloat(detailsData.data[0].nav),
                category: detailsData.meta.scheme_category,
                aum: 0, // AUM not provided by this API
                expenseRatio: 0, // Expense ratio not provided
                chartData,
            }
        }
        return details as AssetDetails;
    } catch (error) {
        console.error(`Failed to fetch details for ${assetId}:`, error);
        return null;
    }
};

/**
 * Searches for assets based on a query string from live APIs.
 */
export const searchAssets = async (query: string): Promise<AssetSearchResult[]> => {
    if (!query) return [];
    
    const useMock = UPSTOX_API_KEY.startsWith('YOUR_');
     if (useMock) {
        return Object.values(MOCK_ASSETS)
            .filter(asset => 
                asset.name.toLowerCase().includes(query.toLowerCase()) || 
                asset.id.toLowerCase().includes(query.toLowerCase())
            )
            .map(asset => ({ id: asset.id, name: asset.name, type: asset.type }));
    }

    try {
        const results: AssetSearchResult[] = [];

        // Search Upstox for stocks (Hypothetical)
        // const upstoxEndpoint = `${UPSTOX_API_BASE_URL}/search?query=${query}`;
        // const stockRes = await fetch(upstoxEndpoint, { headers: { ... } });
        // const stockData = await stockRes.json();
        // results.push(...stockData.data.map(item => ({ id: item.tradingsymbol, name: item.name, type: 'STOCK' })));

        // Search MF API for mutual funds
        const mfEndpoint = `https://api.mfapi.in/mf/search?q=${query}`;
        const mfRes = await fetch(mfEndpoint);
        const mfData = await mfRes.json();
        if (mfData) {
            results.push(...mfData.map((item: any) => ({ id: item.schemeCode.toString(), name: item.schemeName, type: 'MUTUAL_FUND' })));
        }
        
        return results;

    } catch (error) {
        console.error("Failed to search assets:", error);
        return [];
    }
};