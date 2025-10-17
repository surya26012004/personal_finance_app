export enum CalculatorType {
    FD = 'FD',
    SIP = 'SIP',
    STEP_SIP = 'STEP_SIP',
    LUMPSUM_SIP = 'LUMPSUM_SIP',
    SWP = 'SWP',
    EMI = 'EMI',
    PORTFOLIO = 'PORTFOLIO'
}

export interface FdInput {
    principal: number;
    rate: number;
    years: number;
}

export interface FdResult {
    maturityValue: number;
    totalInvestment: number;
    totalInterest: number;
    chartData: { year: number; value: number }[];
}

export interface SipInput {
    monthlyInvestment: number;
    rate: number;
    years: number;
}

export interface SipResult {
    futureValue: number;
    totalInvestment: number;
    totalInterest: number;
    chartData: { year: number; value: number }[];
}


export interface StepSipInput extends SipInput {
    annualIncrease: number; // Percentage
}

export interface LumpsumSipInput extends StepSipInput {
    lumpsum: number;
}

export interface SwpInput {
    initialInvestment: number;
    monthlyWithdrawal: number;
    rate: number;
    years: number;
}

export interface SwpResult {
    finalBalance: number;
    totalWithdrawn: number;
    totalInterest: number;
    chartData: { year: number; value: number }[];
}

export interface EmiInput {
    amount: number;
    rate: number;
    tenure: number; // in years
}

export interface AmortizationData {
    month: number;
    principal: number;
    interest: number;
    totalPayment: number;
    balance: number;
}

export interface EmiResult {
    monthlyEmi: number;
    totalInterest: number;
    totalPayment: number;
    amortization: AmortizationData[];
}

// Portfolio Types
export type AssetType = 'STOCK' | 'MUTUAL_FUND';

export interface StockAsset {
    id: string; // Ticker
    type: 'STOCK';
    name: string;
    quantity: number;
    avgPrice: number;
    sector: string;
}

export interface MutualFundAsset {
    id: string; // Scheme Code
    type: 'MUTUAL_FUND';
    name: string;
    quantity: number; // units
    avgPrice: number; // avg NAV
    category: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
}

export type PortfolioAsset = StockAsset | MutualFundAsset;


export interface WatchlistItem {
    id: string;
    type: AssetType;
    name: string;
}

export interface MarketData {
    currentPrice: number;
    dayChange: number;
    dayChangePercent: number;
}

export interface StockDetails {
    marketCap: number;
    peRatio: number;
    week52High: number;
    week52Low: number;
    sector: string;
}

export interface MutualFundDetails {
    aum: number; // Asset Under Management in Crores
    expenseRatio: number;
    nav: number;
    category: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
}

export type AssetDetails = (StockDetails | MutualFundDetails) & {
    id: string;
    name: string;
    type: AssetType;
    chartData: Record<string, { date: string; value: number }[]>;
};

export interface PortfolioHistoryPoint {
    date: string;
    invested: number;
    value: number;
}

export interface AssetSearchResult {
    id: string;
    name: string;
    type: AssetType;
}