
import React, { useState } from 'react';
// FIX: Import Transition type from framer-motion to resolve type error.
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { CalculatorType } from './types';
import Dashboard from './components/Dashboard';
import FdCalculator from './components/calculators/FdCalculator';
import SipCalculator from './components/calculators/SipCalculator';
import StepSipCalculator from './components/calculators/StepSipCalculator';
import LumpsumSipCalculator from './components/calculators/LumpsumSipCalculator';
import SwpCalculator from './components/calculators/SwpCalculator';
import ThemeToggle from './components/ThemeToggle';
import { Icon } from './components/ui/Icon';

const AppContent: React.FC = () => {
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);
    const { theme } = useTheme();

    const renderCalculator = () => {
        switch (activeCalculator) {
            case CalculatorType.FD:
                return <FdCalculator />;
            case CalculatorType.SIP:
                return <SipCalculator />;
            case CalculatorType.STEP_SIP:
                return <StepSipCalculator />;
            case CalculatorType.LUMPSUM_SIP:
                return <LumpsumSipCalculator />;
            case CalculatorType.SWP:
                return <SwpCalculator />;
            default:
                return null;
        }
    };

    const pageVariants = {
        initial: { opacity: 0, x: -50 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 50 },
    };

    // FIX: Add explicit Transition type to ensure correct type checking.
    const pageTransition: Transition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    return (
        <div className={`min-h-screen w-full text-text-primary-light dark:text-text-primary-dark transition-colors duration-300`}>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-white to-green-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-800 -z-10"></div>
            
            <header className="p-4 sm:p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="logo" className="w-6 h-6 text-white"/>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-light dark:text-primary-dark">Aura Finance</h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {activeCalculator === null ? (
                        <motion.div
                            key="dashboard"
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            <Dashboard onSelectCalculator={setActiveCalculator} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeCalculator}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            {renderCalculator()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
             <footer className="text-center p-4 text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Built with passion for financial clarity.
            </footer>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App;