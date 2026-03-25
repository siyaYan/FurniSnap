import React from 'react';
import { FurnitureItem } from '../types';
import { FurnitureCard } from './FurnitureCard';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsPageProps {
  items: FurnitureItem[];
  identifiedAs: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ items, identifiedAs }) => {
  const filters = ['Price Range', 'Brand & Category', 'Colors & Materials', 'Style'];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex flex-wrap gap-4 mb-16">
        {filters.map((filter) => (
          <button 
            key={filter}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-brand-dark/10 bg-white text-sm font-medium hover:border-brand-terracotta transition-colors"
          >
            {filter}
            <ChevronDown size={14} />
          </button>
        ))}
      </div>

      <div className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-serif text-brand-dark mb-2"
        >
          Found Matches
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-brand-dark/60"
        >
          Identified: <span className="font-medium text-brand-dark">{identifiedAs}</span>.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item, index) => (
          <FurnitureCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};
