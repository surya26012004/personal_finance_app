
import React, { useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { calculateSwp } from '../../utils/calculator';
import type { SwpInput, SwpResult } from '../../types';
import InputSlider from '../ui/InputSlider';
import AnimatedCounter from '../ui/AnimatedCounter';
import ResultChart from '../ui/ResultChart';
import { Card } from '../ui/Card';

const SwpCalculator: React.FC = () => {
    const [input, setInput] = useLocalStorage<SwpInput>('swp-input', {
        initialInvestment: 10000000,
        monthlyWithdrawal: 50000,
        rate: 8,
        years: 20,
    });

    const result: SwpResult = useMemo(() => calculateSwp(input), [input]);

    const handleInputChange = (field: keyof SwpInput) => (value: number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-6">SWP Details</h3>
                <div className="space-y-6">
                    <InputSlider
                        label="Total Investment"
                        value={input.initialInvestment}
                        onChange={handleInputChange('initialInvestment')}
                        min={100000}
                        max={50000000}
                        step={100000}
                        unit="₹"
                    />
                    <InputSlider
                        label="Monthly Withdrawal"
                        value={input.monthlyWithdrawal}
                        onChange={handleInputChange('monthlyWithdrawal')}
                        min={1000}
                        max={200000}
                        step={1000}
                        unit="₹"
                    />
                    <InputSlider
                        label="Expected Return Rate (p.a.)"
                        value={input.rate}
                        onChange={handleInputChange('rate')}
                        min={1}
                        max={20}
                        step={0.5}
                        unit="%"
                    />
                     <InputSlider
                        label="Withdrawal Period"
                        value={input.years}
                        onChange={handleInputChange('years')}
                        min={1}
                        max={40}
                        step={1}
                        unit="Yrs"
                    />
                </div>
            </Card>

            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card>
                    <div className="space-y-4">
                        <div>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Final Balance after {input.years} years</p>
                            <AnimatedCounter value={result.finalBalance} className="text-3xl font-bold text-primary-light dark:text-primary-dark"/>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Total Withdrawn</span>
                            <span className="font-medium">₹{result.totalWithdrawn.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Interest Gained</span>
                             <span className="font-medium text-secondary-light dark:text-secondary-dark">₹{result.totalInterest.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </Card>
                <Card>
                   <h3 className="text-lg font-semibold mb-4">Corpus Depletion</h3>
                   <ResultChart data={result.chartData} />
                </Card>
            </div>
        </div>
    );
};

export default SwpCalculator;
