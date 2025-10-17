
import React from 'react';
import { motion } from 'framer-motion';

interface CalculatorWrapperProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({ title, onBack, children }) => {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <motion.button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-500/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>
                <h2 className="text-3xl font-bold">{title}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {children}
            </div>
        </div>
    );
};

export default CalculatorWrapper;
