import React from 'react';
import { FAVORITES } from '../data';
import { Heart } from 'lucide-react';
import { SampleGrid } from './SampleGrid';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const sidebarItems = ['My Favorites', 'Mood Boards', 'Search History'];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 flex gap-16">
      <aside className="w-64 flex-shrink-0">
        <nav className="flex flex-col gap-6">
          {sidebarItems.map((item, index) => (
            <button 
              key={item}
              className={`text-left text-2xl font-serif transition-colors ${index === 0 ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark'}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-serif text-brand-dark mb-12"
          >
            Welcome back, Sarah
          </motion.h2>

          <section className="mb-16">
            <h3 className="text-xl font-medium text-brand-dark mb-8">My Favorites</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {FAVORITES.map((fav, index) => (
                <motion.div 
                  key={fav.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative w-48 aspect-square bg-white rounded-3xl p-4 shadow-sm flex-shrink-0 group"
                >
                  <img 
                    src={fav.image} 
                    alt="Favorite" 
                    className="w-full h-full object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 text-brand-terracotta">
                    <Heart size={16} fill="currentColor" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-medium text-brand-dark mb-8">Curated for You</h3>
            <div className="scale-105 origin-left">
              <SampleGrid />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
