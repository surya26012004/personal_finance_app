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
// UPSTOX API INTEGRATION - ACTION REQUIRED
// ===================================================================================
// 1. Go to https://upstox.com/developer/, create an app, and get your API key and secret.
// 2. You need to generate an access token. This is typically done via an OAuth2 flow.
//    For development, you can generate one manually using their tools or a simple script.
// 3. Paste your access token below to enable live market data.
// ===================================================================================

const UPSTOX_ACCESS_TOKEN = '41bb896b-eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2UUI3U1kiLCJqdGkiOiI2OGYyODg2YTkyYzczNjU4M2YyMjY5NGEiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzYwNzI1MDk4LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NjA3Mzg0MDB9.NC8DcREchHCpkbkrR1bhiqb68LSmEb9Z8DMWPJdZGmM-4fa6-b77b-1bcd6c8adcf0'; // <-- PASTE YOUR GENERATED ACCESS TOKEN HERE
const UPSTOX_API_BASE_URL = 'https://api.upstox.com/v2';
const USE_MOCK_DATA = !UPSTOX_ACCESS_TOKEN;


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

const MOCK_ASSETS: Record<string, (Partial<StockDetails> | Partial<MutualFundDetails>) & { id: string; name: string; type: AssetType; }> = {
    'NSE_EQ|INE002A01018': { id: 'NSE_EQ|INE002A01018', name: 'Reliance Industries Ltd', type: 'STOCK', week52High: 3024, week52Low: 2220, sector: 'Energy' },
    'NSE_EQ|INE040A01034': { id: 'NSE_EQ|INE040A01034', name: 'HDFC Bank Ltd', type: 'STOCK', week52High: 1757, week52Low: 1363, sector: 'Financials' },
    'NSE_EQ|INE467B01029': { id: 'NSE_EQ|INE467B01029', name: 'Tata Consultancy Services Ltd', type: 'STOCK', week52High: 4254, week52Low: 3070, sector: 'IT' },
    'MF_FO|120530': { id: 'MF_FO|120530', name: 'Parag Parikh Flexi Cap Fund', type: 'MUTUAL_FUND', nav: 76.5, category: 'Equity' },
    'MF_FO|119554': { id: 'MF_FO|119554', name: 'Axis Bluechip Fund', type: 'MUTUAL_FUND', nav: 57.2, category: 'Equity' },
};

const MOCK_MARKET_DATA: Record<string, MarketData> = {
    'NSE_EQ|INE002A01018': { currentPrice: 2950.75, dayChange: 25.40, dayChangePercent: 0.87 },
    'NSE_EQ|INE040A01034': { currentPrice: 1680.20, dayChange: -10.15, dayChangePercent: -0.60 },
    'NSE_EQ|INE467B01029': { currentPrice: 3850.00, dayChange: 42.10, dayChangePercent: 1.11 },
    'MF_FO|120530': { currentPrice: 76.5, dayChange: 0.35, dayChangePercent: 0.46 },
    'MF_FO|119554': { currentPrice: 57.2, dayChange: -0.12, dayChangePercent: -0.21 },
};

const commonApiHeaders = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`
};

// --- API Functions ---

/**
 * Fetches real-time market data for a list of assets from Upstox.
 */
export const getMarketData = async (assets: (PortfolioAsset | WatchlistItem)[]): Promise<Record<string, MarketData>> => {
    if (USE_MOCK_DATA || assets.length === 0) {
        if (USE_MOCK_DATA && assets.length > 0) {
            console.warn("Using MOCK market data. Set your Upstox Access Token for live data.");
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (assets.length === 0) return {};
        const assetIds = assets.map(a => a.id);
        return Object.fromEntries(Object.entries(MOCK_MARKET_DATA).filter(([key]) => assetIds.includes(key)));
    }

    const instrumentKeys = assets.map(a => a.id).join(',');
    try {
        const endpoint = `${UPSTOX_API_BASE_URL}/market-quote/quotes?instrument_key=${instrumentKeys}`;
        const response = await fetch(endpoint, { headers: commonApiHeaders });
        if (!response.ok) throw new Error(`Upstox API Error: ${response.statusText}`);
        
        const jsonResponse = await response.json();
        const data = jsonResponse.data;

        const results: Record<string, MarketData> = {};
        for (const key in data) {
            const quote = data[key];
            results[key] = {
                currentPrice: quote.last_price,
                dayChange: quote.change,
                dayChangePercent: quote.net_change, // In Upstox API, net_change is percentage
            };
        }
        return results;
    } catch (error) {
        console.error(`Failed to fetch market data from Upstox:`, error);
        return {}; // Return empty on error
    }
};

/**
 * Fetches detailed information for a single asset from Upstox.
 */
export const getAssetDetails = async (assetId: string, assetType: AssetType): Promise<AssetDetails | null> => {
     if (USE_MOCK_DATA) {
        console.warn(`Using MOCK asset details for ${assetId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const assetInfo = MOCK_ASSETS[assetId];
        if (!assetInfo) return null;

        const marketData = MOCK_MARKET_DATA[assetId];
        const basePrice = marketData ? marketData.currentPrice : 1000;

        return { 
            ...assetInfo,
            marketCap: 0,
            peRatio: 0,
            aum: 0,
            expenseRatio: 0,
            chartData: generateMockChartData(basePrice) 
        } as AssetDetails;
    }

    try {
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0];

        const historyPromise = fetch(`${UPSTOX_API_BASE_URL}/historical-candle/${assetId}/day/${toDate}/${fromDate}`, { headers: commonApiHeaders }).then(r => r.json());
        const ohlcPromise = fetch(`${UPSTOX_API_BASE_URL}/market-quote/ohlc?instrument_key=${assetId}`, { headers: commonApiHeaders }).then(r => r.json());
        // We need to get the name from somewhere. Search is one way.
        const searchPromise = fetch(`${UPSTOX_API_BASE_URL}/search/instruments?query=${assetId.split('|')[1]}`, { headers: commonApiHeaders }).then(r => r.json());

        const [historyResponse, ohlcResponse, searchResponse] = await Promise.all([historyPromise, ohlcPromise, searchPromise]);
        
        if (historyResponse.status !== 'success' || ohlcResponse.status !== 'success' || searchResponse.status !== 'success') {
            throw new Error('One or more Upstox detail APIs failed');
        }

        const chartPoints = historyResponse.data.candles.map((c: any) => ({
            date: c[0].split('T')[0],
            value: c[4] // Closing price
        })).reverse();
        
        const ohlcData = ohlcResponse.data[assetId];
        const instrumentData = searchResponse.data.find((d: any) => d.instrument_key === assetId);

        let details: Partial<AssetDetails> = {
            id: assetId,
            name: instrumentData?.name || instrumentData?.tradingsymbol || 'Unknown Asset',
            type: assetType,
            week52High: ohlcData?.ohlc?.['52w_h'] || 0,
            week52Low: ohlcData?.ohlc?.['52w_l'] || 0,
            chartData: {
                '1M': chartPoints.slice(-22),
                '6M': chartPoints.slice(-132),
                '1Y': chartPoints.slice(-252),
                '5Y': chartPoints,
            },
        };

        if (assetType === 'STOCK') {
            details = { ...details, sector: 'N/A', marketCap: 0, peRatio: 0 } as Partial<StockDetails>;
        } else {
             details = { ...details, category: (instrumentData?.instrument_type || 'Other') as any, nav: ohlcData.last_price, aum: 0, expenseRatio: 0 } as Partial<MutualFundDetails>;
        }

        return details as AssetDetails;

    } catch (error) {
        console.error(`Failed to fetch details for ${assetId} from Upstox:`, error);
        return null;
    }
};

/**
 * Searches for assets based on a query string from Upstox.
 */
export const searchAssets = async (query: string): Promise<AssetSearchResult[]> => {
    if (!query) return [];
    
    if (USE_MOCK_DATA) {
        console.warn(`Using MOCK asset search.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return Object.values(MOCK_ASSETS)
            .filter(asset => 
                asset.name.toLowerCase().includes(query.toLowerCase()) || 
                asset.id.toLowerCase().includes(query.toLowerCase())
            )
            .map(asset => ({ id: asset.id, name: asset.name, type: asset.type }));
    }
    
    try {
        const endpoint = `${UPSTOX_API_BASE_URL}/search/instruments?query=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint, { headers: commonApiHeaders });
        if (!response.ok) throw new Error(`Upstox Search API Error: ${response.statusText}`);

        const jsonResponse = await response.json();
        
        return jsonResponse.data
            .filter((item: any) => 
                (item.exchange === 'NSE' && item.instrument_type === 'EQUITY') || 
                (item.exchange === 'MF_FO' && item.instrument_type === 'MUTUALFUND')
            )
            .map((item: any) => ({
                id: item.instrument_key,
                name: item.tradingsymbol,
                type: item.instrument_type === 'EQUITY' ? 'STOCK' : 'MUTUAL_FUND'
            }));

    } catch(error) {
        console.error('Failed to search assets on Upstox:', error);
        return [];
    }
};
