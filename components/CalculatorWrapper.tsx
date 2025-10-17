import React from 'react';

interface CalculatorWrapperProps {
    title: string;
    children: React.ReactNode;
}

const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({ title, children }) => {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-center">{title}</h2>
            </div>
            {children}
        </div>
    );
};

export default CalculatorWrapper;