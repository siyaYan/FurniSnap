import React from 'react';
import { User, View } from '../types';
import { User as UserIcon, LogIn } from 'lucide-react';

interface NavbarProps {
  view: View;
  setView: (view: View) => void;
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ view, setView, user }) => {
  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-transparent relative z-10">
      <div 
        className="text-3xl font-serif cursor-pointer text-brand-terracotta"
        onClick={() => setView('landing')}
      >
        FurniSnap
      </div>
      
      <div className="flex items-center gap-8 text-sm font-medium text-brand-dark/70">
        <button 
          onClick={() => setView('landing')}
          className="hover:text-brand-terracotta transition-colors"
        >
          Explore
        </button>
        <button className="hover:text-brand-terracotta transition-colors">
          About
        </button>
        
        {user ? (
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 hover:text-brand-terracotta transition-colors"
          >
            {user.name}
            <div className="w-8 h-8 rounded-full bg-brand-sage/20 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
          </button>
        ) : (
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 hover:text-brand-terracotta transition-colors"
          >
            Login
            <div className="w-8 h-8 rounded-full bg-brand-sage/20 flex items-center justify-center">
              <LogIn size={18} />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};
