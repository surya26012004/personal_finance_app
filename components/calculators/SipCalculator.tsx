
import React, { useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { calculateSip } from '../../utils/calculator';
import type { SipInput, SipResult } from '../../types';
import InputSlider from '../ui/InputSlider';
import AnimatedCounter from '../ui/AnimatedCounter';
import ResultChart from '../ui/ResultChart';
import { Card } from '../ui/Card';

const SipCalculator: React.FC = () => {
    const [input, setInput] = useLocalStorage<SipInput>('sip-input', {
        monthlyInvestment: 10000,
        rate: 12,
        years: 10,
    });

    const result: SipResult = useMemo(() => calculateSip(input), [input]);

    const handleInputChange = (field: keyof SipInput) => (value: number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-6">SIP Details</h3>
                <div className="space-y-6">
                    <InputSlider
                        label="Monthly Investment"
                        value={input.monthlyInvestment}
                        onChange={handleInputChange('monthlyInvestment')}
                        min={500}
                        max={100000}
                        step={500}
                        unit="₹"
                    />
                    <InputSlider
                        label="Expected Return Rate (p.a.)"
                        value={input.rate}
                        onChange={handleInputChange('rate')}
                        min={1}
                        max={30}
                        step={0.5}
                        unit="%"
                    />
                    <InputSlider
                        label="Time Period"
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
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Expected Amount</p>
                            <AnimatedCounter value={result.futureValue} className="text-3xl font-bold text-primary-light dark:text-primary-dark"/>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Invested Amount</span>
                            <span className="font-medium">₹{result.totalInvestment.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Wealth Gained</span>
                             <span className="font-medium text-secondary-light dark:text-secondary-dark">₹{result.totalInterest.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </Card>
                <Card>
                   <h3 className="text-lg font-semibold mb-4">Investment Growth</h3>
                   <ResultChart data={result.chartData} />
                </Card>
            </div>
        </div>
    );
};

export default SipCalculator;
