import React from 'react';

export default function LogoIcon({ className = '', ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="16" cy="16" r="14" />
      <path d="M16 8v8l6 4" />
      <text x="16" y="21" textAnchor="middle" fontSize="8" fill="currentColor">CG</text>
    </svg>
  );
}
