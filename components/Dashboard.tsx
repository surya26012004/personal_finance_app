
import React from 'react';
// FIX: Import Variants type from framer-motion to resolve type error.
import { motion, Variants } from 'framer-motion';
import { CALCULATORS } from '../constants';
import { CalculatorType } from '../types';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

interface DashboardProps {
    onSelectCalculator: (calculator: CalculatorType) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

// FIX: Add explicit Variants type to ensure correct type checking.
const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
        },
    },
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectCalculator }) => {
    return (
        <div className="text-center">
            <motion.h2 
                className="text-3xl sm:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Plan Your Financial Future
            </motion.h2>
            <motion.p 
                className="text-md sm:text-lg text-text-secondary-light dark:text-text-secondary-dark mb-12 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                Select a calculator to get started. All your inputs are saved locally for your convenience.
            </motion.p>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {CALCULATORS.map((calc) => (
                    <motion.div key={calc.id} variants={itemVariants}>
                        <Card
                            className="text-left h-full cursor-pointer group"
                            onClick={() => onSelectCalculator(calc.id)}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-primary-light/10 dark:bg-primary-dark/20 rounded-lg">
                                    <Icon name={calc.icon} className="w-6 h-6 text-primary-light dark:text-primary-dark" />
                                </div>
                                <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">{calc.name}</h3>
                            </div>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark flex-grow">{calc.description}</p>
                            <div className="mt-4 text-primary-light dark:text-primary-dark font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open Calculator <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Dashboard;