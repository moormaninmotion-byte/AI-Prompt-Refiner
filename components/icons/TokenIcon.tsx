
import React from 'react';

export const TokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="m16.5 7.5-8 8" />
    <path d="m16.5 16.5-8-8" />
    <path d="M7 13h1" />
    <path d="M16 8h1" />
  </svg>
);
