import type { FdInput, FdResult, SipInput, SipResult, StepSipInput, SwpInput, SwpResult, LumpsumSipInput } from '../types';

export const calculateFd = (input: FdInput): FdResult => {
    const { principal, rate, years } = input;
    const n = 4; // Compounded quarterly
    const r = rate / 100;
    const t = years;
    const maturityValue = principal * Math.pow((1 + r / n), n * t);
    const totalInvestment = principal;
    const totalInterest = maturityValue - totalInvestment;

    const chartData = [];
    for (let i = 0; i <= years; i++) {
        chartData.push({
            year: i,
            value: principal * Math.pow((1 + r / n), n * i),
        });
    }

    return { maturityValue, totalInvestment, totalInterest, chartData };
};


export const calculateSip = (input: SipInput): SipResult => {
    const { monthlyInvestment, rate, years } = input;
    const n = years * 12;
    const i = rate / 100 / 12;
    const futureValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvestment = monthlyInvestment * n;
    const totalInterest = futureValue - totalInvestment;

    const chartData = [];
    let currentValue = 0;
    for (let y = 0; y <= years; y++) {
        const months = y * 12;
        currentValue = monthlyInvestment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        chartData.push({ year: y, value: currentValue });
    }
    
    return { futureValue, totalInvestment, totalInterest, chartData };
};


export const calculateStepSip = (input: StepSipInput): SipResult => {
    const { monthlyInvestment, rate, years, annualIncrease } = input;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;

    let futureValue = 0;
    let totalInvestment = 0;
    let currentMonthlySip = monthlyInvestment;
    
    const chartData = [{ year: 0, value: 0 }];

    for (let month = 1; month <= totalMonths; month++) {
        // At the beginning of a new year (after the first), increase the SIP amount
        if (month > 1 && (month - 1) % 12 === 0) {
            currentMonthlySip *= (1 + annualIncrease / 100);
        }
        
        totalInvestment += currentMonthlySip;
        
        // Assumes investment at the beginning of the month
        futureValue = (futureValue + currentMonthlySip) * (1 + monthlyRate);
        
        // Store chart data at the end of each year
        if (month % 12 === 0) {
            chartData.push({ year: month / 12, value: futureValue });
        }
    }
    
    const totalInterest = futureValue - totalInvestment;

    return { futureValue, totalInvestment, totalInterest, chartData };
};

export const calculateLumpsumSip = (input: LumpsumSipInput): SipResult => {
    const { lumpsum, ...sipInput } = input;
    
    const stepSipResult = calculateStepSip(sipInput);
    
    const monthlyRate = sipInput.rate / 100 / 12;
    const totalMonths = sipInput.years * 12;

    const lumpsumFv = lumpsum * Math.pow(1 + monthlyRate, totalMonths);

    const futureValue = stepSipResult.futureValue + lumpsumFv;
    const totalInvestment = stepSipResult.totalInvestment + lumpsum;
    const totalInterest = futureValue - totalInvestment;
    
    const chartData = stepSipResult.chartData.map(data => ({
        ...data,
        value: data.value + (lumpsum * Math.pow(1 + monthlyRate, data.year * 12)),
    }));

    return { futureValue, totalInvestment, totalInterest, chartData };
};


export const calculateSwp = (input: SwpInput): SwpResult => {
    const { initialInvestment, monthlyWithdrawal, rate, years } = input;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;

    let balance = initialInvestment;
    const chartData = [{ year: 0, value: initialInvestment }];
    let totalWithdrawn = 0;

    for (let i = 1; i <= totalMonths; i++) {
        balance = balance * (1 + monthlyRate) - monthlyWithdrawal;
        totalWithdrawn += monthlyWithdrawal;
        if (i % 12 === 0) {
            chartData.push({ year: i / 12, value: Math.max(0, balance) });
        }
        if(balance <= 0) break;
    }
    
    const finalBalance = Math.max(0, balance);
    const totalInterest = (finalBalance + totalWithdrawn) - initialInvestment;

    return { finalBalance, totalWithdrawn, totalInterest, chartData };
};
