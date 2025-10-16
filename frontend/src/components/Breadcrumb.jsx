import React from 'react';
import './Breadcrumb.css';

const Breadcrumb = ({ items, onItemClick }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                ›
              </span>
            )}
            {item.href ? (
              <button
                className="breadcrumb-link"
                onClick={() => onItemClick?.(item.href)}
                aria-label={`Naviguer vers ${item.label}`}
              >
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
