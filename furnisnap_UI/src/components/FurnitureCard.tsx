import React from 'react';
import { FurnitureItem } from '../types';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface FurnitureCardProps {
  item: FurnitureItem;
  index: number;
}

export const FurnitureCard: React.FC<FurnitureCardProps> = ({ item, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-brand-sage/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          {item.matchPercentage}% match
        </div>
        <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brand-terracotta hover:bg-brand-terracotta hover:text-white transition-colors">
          <Heart size={16} />
        </button>
      </div>
      
      <h3 className="font-medium text-brand-dark mb-1 line-clamp-1">{item.name}</h3>
      <p className="text-lg font-bold text-brand-dark mb-1">${item.price.toFixed(2)}</p>
      <p className="text-xs text-brand-dark/40">{item.brand}</p>
    </motion.div>
  );
};
