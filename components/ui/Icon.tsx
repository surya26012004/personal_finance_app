
import React from 'react';

export type IconName = 'logo' | 'fd' | 'sip' | 'stepSip' | 'lumpsumSip' | 'swp';

const ICONS: Record<IconName, React.ReactNode> = {
    logo: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    fd: <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l18-4M4 10h16v11H4V10z" />,
    sip: <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />,
    stepSip: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6h6" />,
    lumpsumSip: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.333 0-5 2-5 4s1.667 4 5 4 5-2 5-4-1.667-4-5-4zm0 6c-1.667 0-3-1-3-2s1.333-2 3-2 3 1 3 2-1.333 2-3 2zM3 12h3m15 0h-3M12 3v3m0 15v-3" />,
    swp: <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5l-3 3-3-3" />,
};

interface IconProps {
    name: IconName;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {ICONS[name]}
        </svg>
    );
};
