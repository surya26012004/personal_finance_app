import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { ThemeProvider } from './hooks/useTheme';
import { CalculatorType } from './types';
import { FEATURES } from './constants';
import Dashboard from './components/Dashboard';
import FdCalculator from './components/calculators/FdCalculator';
import SipCalculator from './components/calculators/SipCalculator';
import StepSipCalculator from './components/calculators/StepSipCalculator';
import LumpsumSipCalculator from './components/calculators/LumpsumSipCalculator';
import SwpCalculator from './components/calculators/SwpCalculator';
import EmiCalculator from './components/calculators/EmiCalculator';
import PortfolioTracker from './components/portfolio/PortfolioTracker';
import ThemeToggle from './components/ThemeToggle';
import { Icon } from './components/ui/Icon';
import CalculatorWrapper from './components/CalculatorWrapper';

const AppContent: React.FC = () => {
    const [history, setHistory] = useState<(CalculatorType | null)[]>([null]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const activeView = history[historyIndex];
    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;

    const handleSelectFeature = useCallback((featureType: CalculatorType) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(featureType);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const navigate = useCallback((direction: 'back' | 'forward' | 'home') => {
        if (direction === 'home') {
             setHistory([null]);
             setHistoryIndex(0);
        } else if (direction === 'back' && canGoBack) {
            setHistoryIndex(prev => prev - 1);
        } else if (direction === 'forward' && canGoForward) {
            setHistoryIndex(prev => prev + 1);
        }
    }, [canGoBack, canGoForward]);


    const renderView = () => {
        if (!activeView) return null;

        const featureInfo = FEATURES.find(c => c.id === activeView);
        let featureComponent: React.ReactNode;

        switch (activeView) {
            case CalculatorType.FD: featureComponent = <FdCalculator />; break;
            case CalculatorType.SIP: featureComponent = <SipCalculator />; break;
            case CalculatorType.STEP_SIP: featureComponent = <StepSipCalculator />; break;
            case CalculatorType.LUMPSUM_SIP: featureComponent = <LumpsumSipCalculator />; break;
            case CalculatorType.SWP: featureComponent = <SwpCalculator />; break;
            case CalculatorType.EMI: featureComponent = <EmiCalculator />; break;
            case CalculatorType.PORTFOLIO: return <PortfolioTracker />; // Does not need the wrapper
            default: return null;
        }

        return (
            <CalculatorWrapper title={featureInfo?.name || ''}>
                {featureComponent}
            </CalculatorWrapper>
        );
    };

    const pageVariants = {
        initial: { opacity: 0, x: -50 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 50 },
    };

    const pageTransition: Transition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    return (
        <div className={`min-h-screen w-full text-text-primary-light dark:text-text-primary-dark transition-colors duration-300`}>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-white to-green-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-800 -z-10"></div>
            
            <header className="p-4 sm:p-6 flex justify-between items-center sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800">
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate('home')}
                    title="Go to Home"
                >
                     <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="logo" className="w-6 h-6 text-white"/>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-light dark:text-primary-dark hidden sm:block">Aura Finance</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('back')}
                        disabled={!canGoBack}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary-light dark:text-text-primary-dark bg-slate-500/10 hover:bg-slate-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Go back"
                    >
                        <Icon name="arrowLeft" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('forward')}
                        disabled={!canGoForward}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary-light dark:text-text-primary-dark bg-slate-500/10 hover:bg-slate-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Go forward"
                    >
                        <Icon name="arrowRight" className="w-5 h-5" />
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {activeView === null ? (
                        <motion.div
                            key="dashboard"
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            <Dashboard onSelectCalculator={handleSelectFeature} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeView}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            {renderView()}
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