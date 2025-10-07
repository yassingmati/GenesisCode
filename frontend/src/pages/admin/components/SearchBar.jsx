
// src/pages/CourseManagement/components/SearchBar.jsx
import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '8px 12px', 
      background: '#fff', 
      borderRadius: '10px', 
      border: '1px solid #e9eef9' 
    }}>
      <FiSearch />
      <input 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        style={{ 
          border: 0, 
          outline: 'none', 
          minWidth: '220px', 
          fontSize: '0.95rem', 
          color: '#223', 
          background: 'transparent' 
        }}
      />
    </div>
  );
}
