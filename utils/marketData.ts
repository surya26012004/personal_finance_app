
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
// 1. Go to finnhub.io, sign up for a free account, and get your API key.
// 2. Paste your API key below to enable live stock market data.
// ===================================================================================

const FINNHUB_API_KEY = 'd3p7johr01qt2em62i90d3p7johr01qt2em62i9g'; // <-- PASTE YOUR KEY HERE
const FINNHUB_API_BASE_URL = 'https://finnhub.io/api/v1';

const MF_API_BASE_URL = 'https://api.mfapi.in'; // Real Free Mutual Fund API

// --- Helper to generate mock chart data for details view ---
const generateMockChartData = (base: number) => {
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


// --- MOCK DATA (For Fallback) ---

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
    const useMock = FINNHUB_API_KEY.startsWith('YOUR_');
    if (useMock || assets.length === 0) {
        if (!useMock) console.warn("Finnhub API Key not set. Falling back to MOCK market data.");
        const assetIds = assets.map(a => a.id);
        return Object.fromEntries(Object.entries(MOCK_MARKET_DATA).filter(([key]) => assetIds.includes(key)));
    }

    const results: Record<string, MarketData> = {};

    const apiCalls = assets.map(async (asset) => {
        try {
            if (asset.type === 'STOCK') {
                const ticker = `${asset.id}.NS`; // Append .NS for NSE stocks
                const endpoint = `${FINNHUB_API_BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.c) { // 'c' is current price in Finnhub response
                    results[asset.id] = {
                        currentPrice: data.c,
                        dayChange: data.d,
                        dayChangePercent: data.dp,
                    };
                }
            } else if (asset.type === 'MUTUAL_FUND') {
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
            }
        } catch (error) {
            console.error(`Failed to fetch data for ${asset.id}:`, error);
            // Fallback to mock data for the failed asset
            if (MOCK_MARKET_DATA[asset.id]) {
                results[asset.id] = MOCK_MARKET_DATA[asset.id];
            }
        }
    });

    await Promise.all(apiCalls);
    return results;
};

/**
 * Fetches detailed information for a single asset.
 */
export const getAssetDetails = async (assetId: string, assetType: AssetType): Promise<AssetDetails | null> => {
    const useMock = FINNHUB_API_KEY.startsWith('YOUR_');
    if (useMock) {
        console.warn(`API Key not set. Falling back to MOCK asset details for ${assetId}.`);
        const assetInfo = MOCK_ASSETS[assetId];
        if (!assetInfo) return null;

        const marketData = MOCK_MARKET_DATA[assetId];
        const basePrice = marketData ? marketData.currentPrice : 1000;

        return { ...assetInfo, chartData: generateMockChartData(basePrice) } as AssetDetails;
    }

    try {
        let details: Partial<AssetDetails>;
        if (assetType === 'STOCK') {
            // NOTE: Finnhub free tier does not provide deep fundamentals like P/E, MarketCap.
            // We will fetch what we can and use mock data for the rest to keep UI consistent.
            const ticker = `${assetId}.NS`;
            const profileEndpoint = `${FINNHUB_API_BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
            const profileRes = await fetch(profileEndpoint);
            const profileData = await profileRes.json();
            
            // For chart data, we'll use mock generator as historical data can be complex.
            const basePrice = MOCK_MARKET_DATA[assetId]?.currentPrice || profileData.shareOutstanding * profileData.marketCapitalization || 1000;
            // FIX: The type of mockDetails needs to include the `name` property, which is present in MOCK_ASSETS but not in the base StockDetails type.
            const mockDetails = MOCK_ASSETS[assetId] as StockDetails & { name: string };

            details = {
                id: assetId,
                name: profileData.name || mockDetails.name,
                type: 'STOCK',
                marketCap: profileData.marketCapitalization * 1000000 || mockDetails.marketCap, // Convert from millions
                sector: profileData.finnhubIndustry || mockDetails.sector,
                peRatio: mockDetails.peRatio, // Not in free tier
                week52High: mockDetails.week52High, // Not in free tier
                week52Low: mockDetails.week52Low,   // Not in free tier
                chartData: generateMockChartData(basePrice) // Using a placeholder
            };

        } else { // MUTUAL_FUND
            const detailsEndpoint = `${MF_API_BASE_URL}/mf/${assetId}`;
            const detailsResponse = await fetch(detailsEndpoint);
            const detailsData = await detailsResponse.json();
            
            // Take the last 5 years of NAV data for the chart
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
                category: detailsData.meta.scheme_category as any,
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
    
    const useMock = FINNHUB_API_KEY.startsWith('YOUR_');
     if (useMock) {
        return Object.values(MOCK_ASSETS)
            .filter(asset => 
                asset.name.toLowerCase().includes(query.toLowerCase()) || 
                asset.id.toLowerCase().includes(query.toLowerCase())
            )
            .map(asset => ({ id: asset.id, name: asset.name, type: asset.type }));
    }

    const stockPromise = fetch(`${FINNHUB_API_BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`).then(res => res.json());
    const mfPromise = fetch(`${MF_API_BASE_URL}/mf/search?q=${query}`).then(res => res.ok ? res.json() : []);

    const [stockResult, mfResult] = await Promise.allSettled([stockPromise, mfPromise]);
    
    const combinedResults: AssetSearchResult[] = [];

    if (stockResult.status === 'fulfilled' && stockResult.value.result) {
        const stockData = stockResult.value.result
            .filter((item: any) => item.symbol.includes('.NS'))
            .map((item: any) => ({
                id: item.symbol.replace('.NS', ''),
                name: item.description,
                type: 'STOCK' as AssetType,
            }));
        combinedResults.push(...stockData);
    } else if (stockResult.status === 'rejected') {
        console.error('Stock search failed:', stockResult.reason);
    }

    if (mfResult.status === 'fulfilled' && Array.isArray(mfResult.value)) {
        const mfData = mfResult.value.map((item: any) => ({
            id: item.schemeCode.toString(),
            name: item.schemeName,
            type: 'MUTUAL_FUND' as AssetType,
        }));
        combinedResults.push(...mfData);
    } else if (mfResult.status === 'rejected') {
        console.error('Mutual fund search failed:', mfResult.reason);
    }

    return combinedResults.slice(0, 10);
};
