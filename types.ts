
export enum CalculatorType {
    FD = 'FD',
    SIP = 'SIP',
    STEP_SIP = 'STEP_SIP',
    LUMPSUM_SIP = 'LUMPSUM_SIP',
    SWP = 'SWP',
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
