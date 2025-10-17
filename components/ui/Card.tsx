
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-foreground-light/80 dark:bg-foreground-dark/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-indigo-500/5 dark:shadow-black/20 transition-all duration-300 hover:shadow-xl hover:border-primary-light/50 dark:hover:border-primary-dark/50 hover:-translate-y-1 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
