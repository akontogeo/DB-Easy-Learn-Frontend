import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function FiltersPanel({ onApply, categories = [] }){
  const [filters, setFilters] = useState({
    category: ''
  });
  const [searchParams] = useSearchParams();

  const handleCategoryChange = (categoryId) => {
    setFilters({ ...filters, category: filters.category === categoryId ? '' : categoryId });
  };

  const handleApply = () => {
    const params = {};
    if(filters.category) params.category = filters.category;
    // Preserve search keyword if it exists
    const keyword = searchParams.get('keyword');
    if(keyword) params.keyword = keyword;
    
    console.log('Applying filters:', params);
    onApply(params);
  };

  const handleClear = () => {
    const empty = { category: '' };
    setFilters(empty);
    // When clearing filters, only keep the search keyword if present
    const keyword = searchParams.get('keyword');
    if(keyword) {
      onApply({ keyword });
    } else {
      // Notify parent to load without filters
      onApply({});
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'sticky',
      top: '20px'
    }}>
      <h3 style={{
        margin: '0 0 24px 0',
        fontSize: '20px',
        fontWeight: 700,
        color: '#222'
      }}>
        FILTERS
      </h3>

      {/* Category Section */}
      <div style={{ marginBottom: '28px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          marginBottom: '12px'
        }}>
          Category
        </h4>
        {categories.map(cat => (
          <label key={cat.category_id} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#555'
          }}>
            <input
              type="radio"
              name="category"
              checked={filters.category === cat.category_id}
              onChange={() => handleCategoryChange(cat.category_id)}
              style={{
                marginRight: '10px',
                cursor: 'pointer',
                accentColor: '#2ea67a'
              }}
            />
            {cat.category_name}
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleApply}
          style={{
            flex: 1,
            background: '#2ea67a',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#268c65'}
          onMouseOut={(e) => e.target.style.background = '#2ea67a'}
        >
          Apply
        </button>

        <button
          onClick={handleClear}
          style={{
            flex: 1,
            background: '#e6e6e6',
            color: '#333',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.background = '#d4d4d4'}
          onMouseOut={(e) => e.target.style.background = '#e6e6e6'}
        >
          Clear
        </button>
      </div>
    </div>
  );
}