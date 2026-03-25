import React from 'react';
import { SAMPLE_SPACES } from '../data';
import { motion } from 'motion/react';

export const SampleGrid: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 pb-20 relative z-10">
      <h2 className="text-center text-sm font-bold tracking-widest text-brand-dark/40 mb-8 uppercase">
        Try a Sample
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {SAMPLE_SPACES.map((sample, index) => (
          <motion.div 
            key={sample.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all">
              <img 
                src={sample.image} 
                alt={sample.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-center text-sm font-medium text-brand-dark/70">
              {sample.title}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
