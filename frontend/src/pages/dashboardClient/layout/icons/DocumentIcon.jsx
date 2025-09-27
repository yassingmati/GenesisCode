import React from 'react';

export default function DocumentIcon({ className = '', ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16v16H4z" />
      <polyline points="8 2 8 6 16 6" />
    </svg>
  );
}
