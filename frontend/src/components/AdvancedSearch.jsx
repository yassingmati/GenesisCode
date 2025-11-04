import React, { useState, useEffect } from 'react';
import './AdvancedSearch.css';

const AdvancedSearch = ({ 
  onSearch, 
  onFilterChange, 
  placeholder = "Rechercher...",
  filters = [],
  showAdvanced = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(showAdvanced);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch?.(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    onFilterChange?.(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(selectedFilters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="advanced-search">
      {/* Search input */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher"
          />
          {searchTerm && (
            <button
              className="clear-button"
              onClick={() => setSearchTerm('')}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
        
        {filters.length > 0 && (
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Afficher les filtres"
          >
            Filtres
            {hasActiveFilters && <span className="filter-badge" />}
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && filters.length > 0 && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtres</h3>
            {hasActiveFilters && (
              <button
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Effacer tout
              </button>
            )}
          </div>
          
          <div className="filters-grid">
            {filters.map((filter) => (
              <div key={filter.key} className="filter-group">
                <label className="filter-label">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    className="filter-select"
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'checkbox' ? (
                  <div className="filter-checkboxes">
                    {filter.options.map((option) => (
                      <label key={option.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.key]?.includes(option.value) || false}
                          onChange={(e) => {
                            const currentValues = selectedFilters[filter.key] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            handleFilterChange(filter.key, newValues);
                          }}
                        />
                        <span className="checkbox-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : filter.type === 'range' ? (
                  <div className="filter-range">
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      value={selectedFilters[filter.key] || filter.min}
                      onChange={(e) => handleFilterChange(filter.key, parseInt(e.target.value))}
                      className="range-slider"
                    />
                    <span className="range-value">
                      {selectedFilters[filter.key] || filter.min}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
