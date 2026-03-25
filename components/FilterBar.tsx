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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="sticky top-0 z-30 bg-brand-beige/80 backdrop-blur-lg py-4 border-b border-brand-dark/10 mb-6 transition-all">
      <div className="max-w-7xl mx-auto px-8 flex flex-col gap-4">

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center gap-2 px-5 py-2 bg-white/60 border border-brand-dark/10 rounded-full text-sm font-medium text-brand-dark/70 whitespace-nowrap hover:bg-white/80 transition-colors"
            aria-expanded={isExpanded}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-terracotta text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="h-5 w-px bg-brand-dark/15 mx-1" />

          <div className="px-4 py-2 bg-brand-dark text-brand-cream rounded-full text-sm font-medium whitespace-nowrap shadow-sm">
            Style: {detectedStyle}
          </div>

          {activeFilterCount > 0 && (
            <button
              className="flex items-center gap-1.5 px-4 py-2 bg-white/60 border border-brand-dark/10 rounded-full text-sm font-medium text-brand-dark/60 hover:bg-white/80 whitespace-nowrap transition-colors"
              onClick={clearFilters}
            >
              Clear <X className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="bg-white/60 border border-brand-dark/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Price Range</p>
              <div className="flex items-center gap-3">
                <label htmlFor="price-min" className="sr-only">Minimum price</label>
                <input
                  id="price-min"
                  type="number"
                  min={0}
                  max={filters.maxPrice}
                  value={filters.minPrice}
                  onChange={(e) => updateMinPrice(Number(e.target.value))}
                  className="w-24 rounded-xl border border-brand-dark/10 bg-white/80 px-2 py-1 text-sm text-brand-dark"
                />
                <span className="text-brand-dark/30 text-sm">to</span>
                <label htmlFor="price-max" className="sr-only">Maximum price</label>
                <input
                  id="price-max"
                  type="number"
                  min={filters.minPrice}
                  max={priceMax}
                  value={filters.maxPrice}
                  onChange={(e) => updateMaxPrice(Number(e.target.value))}
                  className="w-24 rounded-xl border border-brand-dark/10 bg-white/80 px-2 py-1 text-sm text-brand-dark"
                />
              </div>
              <div className="mt-3 space-y-2">
                <label htmlFor="range-min" className="sr-only">Minimum price slider</label>
                <input id="range-min" type="range" min={0} max={priceMax} value={filters.minPrice} onChange={(e) => updateMinPrice(Number(e.target.value))} className="w-full accent-brand-terracotta" />
                <label htmlFor="range-max" className="sr-only">Maximum price slider</label>
                <input id="range-max" type="range" min={0} max={priceMax} value={filters.maxPrice} onChange={(e) => updateMaxPrice(Number(e.target.value))} className="w-full accent-brand-terracotta" />
              </div>
            </div>

            {/* Brand & Category */}
            <div className="bg-white/60 border border-brand-dark/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Brand & Category</p>
              <div className="flex flex-col gap-3">
                <label htmlFor="filter-category" className="sr-only">Category</label>
                <select
                  id="filter-category"
                  value={filters.category || ''}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value || null })}
                  className="rounded-xl border border-brand-dark/10 bg-white/80 px-3 py-2 text-sm text-brand-dark"
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
                  onChange={(e) => onFilterChange({ ...filters, brand: e.target.value || null })}
                  className="rounded-xl border border-brand-dark/10 bg-white/80 px-3 py-2 text-sm text-brand-dark"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colors & Materials */}
            <div className="bg-white/60 border border-brand-dark/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-brand-dark/40 uppercase tracking-widest mb-3">Colors & Materials</p>
              {colors.length === 0 && materials.length === 0 ? (
                <p className="text-xs text-brand-dark/30">No color or material data available.</p>
              ) : (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by color and material">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onFilterChange({ ...filters, colors: toggleItem(filters.colors, color) })}
                      aria-pressed={filters.colors.includes(color)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.colors.includes(color)
                          ? 'bg-brand-terracotta text-white border-brand-terracotta'
                          : 'bg-white/80 text-brand-dark/60 border-brand-dark/10 hover:border-brand-terracotta'
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
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        filters.materials.includes(material)
                          ? 'bg-brand-terracotta text-white border-brand-terracotta'
                          : 'bg-white/80 text-brand-dark/60 border-brand-dark/10 hover:border-brand-terracotta'
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
