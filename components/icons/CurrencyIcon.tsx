import React from 'react';

export const CurrencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="8"></circle>
        <line x1="3" x2="6" y1="3" y2="6"></line>
        <line x1="21" x2="18" y1="3" y2="6"></line>
        <line x1="3" x2="6" y1="21" y2="18"></line>
        <line x1="21" x2="18" y1="21" y2="18"></line>
    </svg>
);
