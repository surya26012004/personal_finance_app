import React from 'react';

export type IconName = 'logo' | 'fd' | 'sip' | 'stepSip' | 'lumpsumSip' | 'swp' | 'emi' | 'arrowLeft' | 'arrowRight' | 'portfolio' | 'stockUp' | 'stockDown' | 'overview' | 'holdings' | 'analytics' | 'watchlist' | 'plus' | 'pencil' | 'trash' | 'close';

const ICONS: Record<IconName, React.ReactNode> = {
    logo: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    fd: <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l18-4M4 10h16v11H4V10z" />,
    sip: <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />,
    stepSip: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6h6" />,
    lumpsumSip: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.333 0-5 2-5 4s1.667 4 5 4 5-2 5-4-1.667-4-5-4zm0 6c-1.667 0-3-1-3-2s1.333-2 3-2 3 1 3 2-1.333 2-3 2zM3 12h3m15 0h-3M12 3v3m0 15v-3" />,
    swp: <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5l-3 3-3-3" />,
    emi: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    arrowLeft: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />,
    arrowRight: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
    portfolio: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7L3 17h18L13 7zM3 7v10h18V7" />,
    stockUp: <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />,
    stockDown: <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />,
    overview: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    holdings: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />,
    analytics: <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" />,
    watchlist: <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
    pencil: <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
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
