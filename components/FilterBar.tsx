import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { SearchFilters } from '../types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  detectedStyle: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, detectedStyle }) => {
  return (
    <div className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-lg py-4 border-b border-stone-200/50 mb-6 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-700 hover:border-stone-400 whitespace-nowrap">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        
        <div className="h-6 w-px bg-stone-300 mx-1"></div>

        {/* Dynamic Style Chip */}
        <button className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm">
          Style: {detectedStyle}
        </button>

        {/* Price Filter (Mock Interaction) */}
        <button 
          className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap"
          onClick={() => {
            // Toggle mock logic for demo
            if (filters.maxPrice < 1000) {
              onFilterChange({...filters, maxPrice: 10000});
            } else {
              onFilterChange({...filters, maxPrice: 500});
            }
          }}
        >
          Price: {filters.maxPrice < 1000 ? "Under $500" : "Any"} <ChevronDown className="w-3 h-3 ml-1" />
        </button>

        <button className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap">
          Category <ChevronDown className="w-3 h-3 ml-1" />
        </button>
        
        <button className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap">
          Brand <ChevronDown className="w-3 h-3 ml-1" />
        </button>

      </div>
    </div>
  );
};

export default FilterBar;