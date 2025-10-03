import React from 'react';

export const ChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 3v18h18"></path>
    <path d="M18.7 8a6 6 0 0 0-6 6"></path>
    <path d="M13 13a2 2 0 0 0 2 2"></path>
  </svg>
);
