import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SampleGrid } from './components/SampleGrid';
import { ResultsPage } from './components/ResultsPage';
import { Dashboard } from './components/Dashboard';
import { View, FurnitureItem, User } from './types';
import { MOCK_FURNITURE } from './data';
import { identifyFurniture } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user] = useState<User | null>({ name: 'Sarah' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identifiedAs, setIdentifiedAs] = useState('');
  const [results, setResults] = useState<FurnitureItem[]>([]);

  const handleUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    
    // Convert file to base64 for Gemini
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const identification = await identifyFurniture(base64);
      
      setIdentifiedAs(identification);
      // Filter mock data to simulate "matching"
      setResults(MOCK_FURNITURE);
      setIsAnalyzing(false);
      setView('results');
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Background Shapes - SVG Waves */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full opacity-40"
        >
          {/* Left Sage Wave */}
          <motion.path
            animate={{
              d: [
                "M 0 100 Q 25 70 0 20 L 0 100 Z",
                "M 0 100 Q 35 60 0 30 L 0 100 Z",
                "M 0 100 Q 25 70 0 20 L 0 100 Z"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            fill="var(--color-brand-sage)"
            className="opacity-60"
          />

          {/* Top Right Beige Wave */}
          <motion.path
            animate={{
              d: [
                "M 100 0 Q 70 35 40 0 L 100 0 Z",
                "M 100 0 Q 80 25 50 0 L 100 0 Z",
                "M 100 0 Q 70 35 40 0 L 100 0 Z"
              ]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            fill="#d6ccc2"
            className="opacity-50"
          />

          {/* Bottom Right Terracotta Wave */}
          <motion.path
            animate={{
              d: [
                "M 100 100 Q 75 75 100 40 L 100 100 Z",
                "M 100 100 Q 85 65 100 50 L 100 100 Z",
                "M 100 100 Q 75 75 100 40 L 100 100 Z"
              ]
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            fill="var(--color-brand-terracotta)"
            className="opacity-70"
          />
        </svg>

        {/* Soft blur overlays for depth */}
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-brand-sage/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[800px] bg-brand-sage/20 rounded-full blur-3xl opacity-30 rotate-12" />
        <div className="absolute -bottom-40 -right-20 w-[700px] h-[700px] bg-brand-terracotta/10 rounded-full blur-3xl opacity-40" />
      </div>

      <Navbar view={view} setView={setView} user={user} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <Loader2 className="w-12 h-12 text-brand-terracotta animate-spin mb-4" />
              <p className="text-xl font-serif text-brand-dark">Analyzing your space...</p>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'landing' && (
                <>
                  <Hero onUpload={handleUpload} />
                  <SampleGrid />
                </>
              )}
              {view === 'results' && (
                <ResultsPage items={results} identifiedAs={identifiedAs} />
              )}
              {view === 'dashboard' && (
                <Dashboard />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center text-brand-dark/30 text-sm relative z-10">
        <p>© 2026 FurniSnap. All rights reserved.</p>
      </footer>
    </div>
  );
}
