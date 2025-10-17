import { CalculatorType } from './types';
import type { IconName } from './components/ui/Icon';

interface FeatureInfo {
    id: CalculatorType;
    name: string;
    description: string;
    icon: IconName;
}

export const FEATURES: FeatureInfo[] = [
     {
        id: CalculatorType.PORTFOLIO,
        name: 'Portfolio Tracker',
        description: 'Track your stocks and mutual funds in real-time.',
        icon: 'portfolio',
    },
    {
        id: CalculatorType.FD,
        name: 'FD Calculator',
        description: 'Calculate Fixed Deposit maturity value and interest.',
        icon: 'fd',
    },
    {
        id: CalculatorType.SIP,
        name: 'SIP Calculator',
        description: 'Estimate returns on your Systematic Investment Plan.',
        icon: 'sip',
    },
    {
        id: CalculatorType.STEP_SIP,
        name: 'Step-up SIP Calculator',
        description: 'Project growth with annual increases in your SIP.',
        icon: 'stepSip',
    },
    {
        id: CalculatorType.LUMPSUM_SIP,
        name: 'Lumpsum + Step-up SIP',
        description: 'Combine a one-time investment with a growing SIP.',
        icon: 'lumpsumSip',
    },
    {
        id: CalculatorType.SWP,
        name: 'SWP Calculator',
        description: 'Plan your Systematic Withdrawal Plan for regular income.',
        icon: 'swp',
    },
    {
        id: CalculatorType.EMI,
        name: 'EMI Calculator',
        description: 'Calculate your Equated Monthly Instalment for loans.',
        icon: 'emi',
    },
];