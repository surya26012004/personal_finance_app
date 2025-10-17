import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
import useLocalStorage from '../../hooks/useLocalStorage';
import { calculateEmi } from '../../utils/calculator';
import type { EmiInput, EmiResult } from '../../types';
import InputSlider from '../ui/InputSlider';
import AnimatedCounter from '../ui/AnimatedCounter';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';

const EmiCalculator: React.FC = () => {
    const [input, setInput] = useLocalStorage<EmiInput>('emi-input', {
        amount: 2500000,
        rate: 8.5,
        tenure: 20, // in years
    });
    const { theme } = useTheme();

    const result: EmiResult = useMemo(() => calculateEmi(input), [input]);

    const handleInputChange = (field: keyof EmiInput) => (value: number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const pieData = [
        { name: 'Principal Amount', value: input.amount },
        { name: 'Total Interest', value: result.totalInterest },
    ];

    const COLORS = theme === 'light' ? ['#4f46e5', '#10b981'] : ['#6366f1', '#34d399'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <Card className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-6">Loan Details</h3>
                <div className="space-y-6">
                    <InputSlider
                        label="Loan Amount"
                        value={input.amount}
                        onChange={handleInputChange('amount')}
                        min={10000}
                        max={50000000}
                        step={10000}
                        unit="₹"
                    />
                    <InputSlider
                        label="Interest Rate (p.a.)"
                        value={input.rate}
                        onChange={handleInputChange('rate')}
                        min={1}
                        max={20}
                        step={0.05}
                        unit="%"
                    />
                    <InputSlider
                        label="Loan Tenure"
                        value={input.tenure}
                        onChange={handleInputChange('tenure')}
                        min={1}
                        max={30}
                        step={1}
                        unit="Yrs"
                    />
                </div>
            </Card>

            {/* Result Section */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card>
                    <div className="space-y-4">
                        <div>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Monthly EMI</p>
                            <AnimatedCounter value={result.monthlyEmi} className="text-3xl font-bold text-primary-light dark:text-primary-dark"/>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Total Interest</span>
                            <span className="font-medium text-secondary-light dark:text-secondary-dark">₹{Math.round(result.totalInterest).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Total Payment (Principal + Interest)</span>
                            <span className="font-medium">₹{Math.round(result.totalPayment).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
                    <div className="h-48 w-full flex items-center justify-center">
                         <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                        borderRadius: '0.75rem'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex justify-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></div>
                            <span>Principal ({((input.amount / result.totalPayment) * 100 || 0).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }}></div>
                            <span>Interest ({((result.totalInterest / result.totalPayment) * 100 || 0).toFixed(1)}%)</span>
                        </div>
                    </div>
                </Card>
                
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Amortization Schedule</h3>
                    <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase sticky top-0 bg-foreground-light/80 dark:bg-foreground-dark/50 backdrop-blur-sm">
                                <tr>
                                    <th scope="col" className="px-2 py-3">Month</th>
                                    <th scope="col" className="px-2 py-3 text-right">Principal</th>
                                    <th scope="col" className="px-2 py-3 text-right">Interest</th>
                                    <th scope="col" className="px-2 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.amortization.map((row, index) => (
                                    <motion.tr 
                                        key={row.month} 
                                        className="border-b border-slate-200 dark:border-slate-700/50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.01 }}
                                    >
                                        <td className="px-2 py-2">{row.month}</td>
                                        <td className="px-2 py-2 text-right">₹{Math.round(row.principal).toLocaleString('en-IN')}</td>
                                        <td className="px-2 py-2 text-right">₹{Math.round(row.interest).toLocaleString('en-IN')}</td>
                                        <td className="px-2 py-2 text-right font-medium">₹{Math.round(row.balance).toLocaleString('en-IN')}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <style>{`
                        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                    `}</style>
                </Card>
            </div>
        </div>
    );
};

export default EmiCalculator;
