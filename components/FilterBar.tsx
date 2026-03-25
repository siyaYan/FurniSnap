'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilters } from '../types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  detectedStyle: string;
  categories: string[];
  brands: string[];
  colors: string[];
  materials: string[];
  priceMax: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  detectedStyle,
  categories,
  brands,
  colors,
  materials,
  priceMax
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleItem = (items: string[], value: string) => {
    if (items.includes(value)) {
      return items.filter(item => item !== value);
    }
    return [...items, value];
  };

  const updateMinPrice = (value: number) => {
    const nextMin = Math.min(value, filters.maxPrice);
    onFilterChange({ ...filters, minPrice: nextMin });
  };

  const updateMaxPrice = (value: number) => {
    const nextMax = Math.max(value, filters.minPrice);
    onFilterChange({ ...filters, maxPrice: nextMax });
  };

  const clearFilters = () => {
    onFilterChange({
      ...filters,
      minPrice: 0,
      maxPrice: priceMax,
      style: null,
      brand: null,
      category: null,
      colors: [],
      materials: []
    });
  };

  const activeFilterCount =
    (filters.brand ? 1 : 0) +
    (filters.category ? 1 : 0) +
    filters.colors.length +
    filters.materials.length +
    (filters.minPrice > 0 || filters.maxPrice < priceMax ? 1 : 0);

  return (
    <div className="sticky top-16 z-30 bg-stone-50/80 backdrop-blur-lg py-4 border-b border-stone-200/50 mb-6 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-4">

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50 transition-colors"
            aria-expanded={isExpanded}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="h-6 w-px bg-stone-300 mx-1" aria-hidden="true"></div>

          <div className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm" aria-label={`Detected style: ${detectedStyle}`}>
            Style: {detectedStyle}
          </div>

          {activeFilterCount > 0 && (
            <button
              className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap"
              onClick={clearFilters}
              aria-label="Clear all filters"
            >
              Clear <X className="w-3 h-3 ml-1" aria-hidden="true" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3" id="price-range-label">Price Range</p>
              <div className="flex items-center gap-3">
                <label htmlFor="price-min" className="sr-only">Minimum price</label>
                <input
                  id="price-min"
                  type="number"
                  min={0}
                  max={filters.maxPrice}
                  value={filters.minPrice}
                  onChange={(event) => updateMinPrice(Number(event.target.value))}
                  className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-sm"
                  aria-labelledby="price-range-label"
                />
                <span className="text-stone-400 text-sm" aria-hidden="true">to</span>
                <label htmlFor="price-max" className="sr-only">Maximum price</label>
                <input
                  id="price-max"
                  type="number"
                  min={filters.minPrice}
                  max={priceMax}
                  value={filters.maxPrice}
                  onChange={(event) => updateMaxPrice(Number(event.target.value))}
                  className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-sm"
                  aria-labelledby="price-range-label"
                />
              </div>
              <div className="mt-3 space-y-2">
                <label htmlFor="range-min" className="sr-only">Minimum price slider</label>
                <input
                  id="range-min"
                  type="range"
                  min={0}
                  max={priceMax}
                  value={filters.minPrice}
                  onChange={(event) => updateMinPrice(Number(event.target.value))}
                  className="w-full"
                  aria-label="Minimum price"
                />
                <label htmlFor="range-max" className="sr-only">Maximum price slider</label>
                <input
                  id="range-max"
                  type="range"
                  min={0}
                  max={priceMax}
                  value={filters.maxPrice}
                  onChange={(event) => updateMaxPrice(Number(event.target.value))}
                  className="w-full"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Brand & Category</p>
              <div className="flex flex-col gap-3">
                <label htmlFor="filter-category" className="sr-only">Category</label>
                <select
                  id="filter-category"
                  value={filters.category || ''}
                  onChange={(event) => onFilterChange({ ...filters, category: event.target.value || null })}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <label htmlFor="filter-brand" className="sr-only">Brand</label>
                <select
                  id="filter-brand"
                  value={filters.brand || ''}
                  onChange={(event) => onFilterChange({ ...filters, brand: event.target.value || null })}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Colors & Materials</p>
              {colors.length === 0 && materials.length === 0 ? (
                <p className="text-xs text-stone-400">No color or material data available for these results.</p>
              ) : (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by color and material">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onFilterChange({ ...filters, colors: toggleItem(filters.colors, color) })}
                      aria-pressed={filters.colors.includes(color)}
                      aria-label={`Filter by color: ${color}`}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.colors.includes(color) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                  {materials.map((material) => (
                    <button
                      key={material}
                      onClick={() => onFilterChange({ ...filters, materials: toggleItem(filters.materials, material) })}
                      aria-pressed={filters.materials.includes(material)}
                      aria-label={`Filter by material: ${material}`}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.materials.includes(material) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FilterBar;
