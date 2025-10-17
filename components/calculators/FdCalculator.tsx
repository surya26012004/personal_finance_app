
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { calculateFd } from '../../utils/calculator';
import type { FdInput, FdResult } from '../../types';
import InputSlider from '../ui/InputSlider';
import AnimatedCounter from '../ui/AnimatedCounter';
import ResultChart from '../ui/ResultChart';
import { Card } from '../ui/Card';

const FdCalculator: React.FC = () => {
    const [input, setInput] = useLocalStorage<FdInput>('fd-input', {
        principal: 500000,
        rate: 7,
        years: 5,
    });

    const result: FdResult = useMemo(() => calculateFd(input), [input]);

    const handleInputChange = (field: keyof FdInput) => (value: number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-6">FD Details</h3>
                <div className="space-y-6">
                    <InputSlider
                        label="Total Investment"
                        value={input.principal}
                        onChange={handleInputChange('principal')}
                        min={1000}
                        max={10000000}
                        step={1000}
                        unit="₹"
                    />
                    <InputSlider
                        label="Expected Return Rate (p.a.)"
                        value={input.rate}
                        onChange={handleInputChange('rate')}
                        min={1}
                        max={20}
                        step={0.1}
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
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Maturity Value</p>
                            <AnimatedCounter value={result.maturityValue} className="text-3xl font-bold text-primary-light dark:text-primary-dark"/>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Invested Amount</span>
                            <span className="font-medium">₹{result.totalInvestment.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Total Interest</span>
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

export default FdCalculator;
