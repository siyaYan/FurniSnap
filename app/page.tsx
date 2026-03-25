'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, RefreshCw, AlertCircle, User, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fileToBase64 } from '../services/imageUtils';
import { searchByImage } from '../services/searchService';
import type { AnalysisResult, Product, SearchFilters } from '../types';
import { LoadingState } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Page: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'price-asc' | 'price-desc'>('score');
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 10000,
    style: null,
    brand: null,
    category: null,
    colors: [],
    materials: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please upload a JPG, PNG, or WEBP image.';
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setLoadingState(LoadingState.ERROR);
        return;
      }
      await processImage(file);
    }
  };

  const processImage = async (file: File) => {
    try {
      setErrorMessage('');
      setLoadingState(LoadingState.UPLOADING);
      const base64 = await fileToBase64(file);
      setPreviewImage(`data:${file.type};base64,${base64}`);

      setLoadingState(LoadingState.ANALYZING);
      const { analysis, products: results } = await searchByImage(base64);
      setAnalysisResult(analysis);

      setLoadingState(LoadingState.SEARCHING);
      setProducts(results);

      try {
        const existing = JSON.parse(localStorage.getItem('furnisnap_history') || '[]');
        const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), analysis, products: results };
        const updated = [entry, ...existing].slice(0, 20);
        localStorage.setItem('furnisnap_history', JSON.stringify(updated));
      } catch { /* ignore */ }

      setLoadingState(LoadingState.COMPLETE);
    } catch (error) {
      console.error(error);
      setErrorMessage('Something went wrong while searching. Please try again.');
      setLoadingState(LoadingState.ERROR);
    }
  };

  const resetSearch = () => {
    setLoadingState(LoadingState.IDLE);
    setPreviewImage(null);
    setAnalysisResult(null);
    setProducts([]);
    setErrorMessage('');
  };

  const maxPriceLimit = Math.max(1000, ...products.map(p => p.price || 0));

  useEffect(() => {
    setFilters(prev => {
      const nextMax = Math.min(prev.maxPrice, maxPriceLimit);
      const nextMin = Math.min(prev.minPrice, nextMax);
      if (nextMax === prev.maxPrice && nextMin === prev.minPrice) return prev;
      return { ...prev, minPrice: nextMin, maxPrice: nextMax };
    });
  }, [maxPriceLimit]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
  const colors = Array.from(new Set(products.flatMap(p => p.colors || []).filter(Boolean))).sort();
  const materials = Array.from(new Set(products.flatMap(p => p.materials || []).filter(Boolean))).sort();

  const SORT_OPTIONS: { value: 'score' | 'price-asc' | 'price-desc'; label: string }[] = [
    { value: 'score', label: 'Best Match' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  const visibleProducts = products.filter(p => {
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (filters.brand && p.brand !== filters.brand) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.colors.length > 0) {
      const productColors = p.colors || [];
      if (!filters.colors.some(color => productColors.includes(color))) return false;
    }
    if (filters.materials.length > 0) {
      const productMaterials = p.materials || [];
      if (!filters.materials.some(material => productMaterials.includes(material))) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.similarityScore - a.similarityScore;
  });

  const isLoading = loadingState === LoadingState.UPLOADING ||
    loadingState === LoadingState.ANALYZING ||
    loadingState === LoadingState.SEARCHING;

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-beige text-brand-dark">

      {/* Animated organic background waves */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
          <motion.path
            animate={{ d: ["M 0 100 Q 25 70 0 20 L 0 100 Z", "M 0 100 Q 35 60 0 30 L 0 100 Z", "M 0 100 Q 25 70 0 20 L 0 100 Z"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            fill="#a3b18a"
            className="opacity-60"
          />
          <motion.path
            animate={{ d: ["M 100 0 Q 70 35 40 0 L 100 0 Z", "M 100 0 Q 80 25 50 0 L 100 0 Z", "M 100 0 Q 70 35 40 0 L 100 0 Z"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            fill="#d6ccc2"
            className="opacity-50"
          />
          <motion.path
            animate={{ d: ["M 100 100 Q 75 75 100 40 L 100 100 Z", "M 100 100 Q 85 65 100 50 L 100 100 Z", "M 100 100 Q 75 75 100 40 L 100 100 Z"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            fill="#bc6c4b"
            className="opacity-70"
          />
        </svg>
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-brand-sage/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[800px] bg-brand-sage/20 rounded-full blur-3xl opacity-30 rotate-12" />
        <div className="absolute -bottom-40 -right-20 w-[700px] h-[700px] bg-brand-terracotta/10 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-transparent relative z-10">
        <div
          className="text-3xl font-sans font-semibold cursor-pointer text-brand-terracotta"
          onClick={resetSearch}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && resetSearch()}
          aria-label="FurniSnap home"
        >
          FurniSnap
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-brand-dark/70">
          <button onClick={resetSearch} className="hover:text-brand-terracotta transition-colors">
            Explore
          </button>
          {loadingState === LoadingState.COMPLETE && (
            <button onClick={resetSearch} className="hover:text-brand-terracotta transition-colors flex items-center gap-1" aria-label="New search">
              <RefreshCw className="w-4 h-4" /> New Search
            </button>
          )}
          <Link href="/profile" aria-label="View profile">
            <div className="flex items-center gap-2 hover:text-brand-terracotta transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-sage/20 flex items-center justify-center">
                <User size={18} />
              </div>
            </div>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        <AnimatePresence mode="wait">

          {/* ERROR STATE */}
          {loadingState === LoadingState.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto px-4 pt-24 flex flex-col items-center text-center"
              role="alert"
            >
              <div className="w-16 h-16 bg-brand-terracotta/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-brand-terracotta" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-dark mb-2">Something went wrong</h2>
              <p className="text-brand-dark/60 mb-6">{errorMessage}</p>
              <button
                onClick={resetSearch}
                className="px-8 py-3 bg-brand-terracotta text-white rounded-full font-medium hover:bg-brand-terracotta/90 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
              aria-live="polite"
            >
              {previewImage && (
                <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-xl mb-8 border-4 border-white/60">
                  <img src={previewImage} alt="Uploaded furniture" className="w-full h-full object-cover" />
                </div>
              )}
              <LoadingScreen step={loadingState as 'UPLOADING' | 'ANALYZING' | 'SEARCHING'} />
            </motion.div>
          )}

          {/* IDLE / LANDING STATE */}
          {loadingState === LoadingState.IDLE && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero */}
              <div className="flex flex-col items-center justify-center pt-12 pb-20 px-4 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-7xl font-bold text-brand-terracotta mb-4"
                >
                  Snap a space. Find your style.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-brand-dark/60 mb-12 max-w-2xl"
                >
                  Upload an image to identify and match furniture styles instantly.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const validationError = validateFile(e.dataTransfer.files[0]);
                      if (!validationError) processImage(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload a furniture image"
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  className="w-full max-w-3xl aspect-[3/1] bg-white/40 backdrop-blur-sm border-2 border-brand-sage/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 transition-all group shadow-xl shadow-brand-dark/5"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Select image file"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-brand-sage/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-brand-sage" />
                  </div>
                  <h3 className="text-xl font-medium text-brand-dark mb-1">
                    Click to upload or drag & drop
                  </h3>
                  <p className="text-sm text-brand-dark/40">
                    Supports JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB
                  </p>
                </motion.div>
              </div>

              {/* Sample Grid */}
              <div className="max-w-6xl mx-auto px-8 pb-20">
                <h2 className="text-center text-sm font-bold tracking-widest text-brand-dark/40 mb-8 uppercase">
                  Try a Sample
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="group cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Try sample furniture image ${i}`}
                      onClick={async () => {
                        const res = await fetch(`https://picsum.photos/400/400?random=${i + 20}`);
                        const blob = await res.blob();
                        processImage(new File([blob], 'sample.jpg', { type: 'image/jpeg' }));
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const res = await fetch(`https://picsum.photos/400/400?random=${i + 20}`);
                          const blob = await res.blob();
                          processImage(new File([blob], 'sample.jpg', { type: 'image/jpeg' }));
                        }
                      }}
                    >
                      <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all">
                        <img
                          src={`https://picsum.photos/400/400?random=${i + 20}`}
                          alt={`Sample furniture ${i}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-brand-dark/70">
                        Sample {i}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {loadingState === LoadingState.COMPLETE && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col"
            >
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                detectedStyle={analysisResult.style}
                categories={categories}
                brands={brands}
                colors={colors}
                materials={materials}
                priceMax={maxPriceLimit}
              />

              <div className="max-w-7xl mx-auto px-8 pb-20 w-full">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-5xl font-bold text-brand-dark mb-2"
                    >
                      Found {visibleProducts.length} Matches
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-brand-dark/60"
                    >
                      Identified: <span className="font-medium text-brand-dark">{analysisResult.category}</span> in <span className="font-medium text-brand-dark">{analysisResult.style}</span> style.
                    </motion.p>
                    <p className="text-sm text-brand-dark/40 mt-1 max-w-2xl">
                      "{analysisResult.description}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-2 flex-wrap" aria-label="Detected colors">
                      {analysisResult.colors.map(color => (
                        <div key={color} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-brand-sage/20 text-xs font-medium text-brand-dark/70">
                          <div className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: color.toLowerCase() }} aria-hidden="true"></div>
                          {color}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <ArrowUpDown className="w-4 h-4 text-brand-dark/30" aria-hidden="true" />
                      <div className="flex rounded-full border border-brand-dark/10 bg-white/50 overflow-hidden text-sm" role="group" aria-label="Sort results">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            aria-pressed={sortBy === opt.value}
                            className={`px-4 py-1.5 font-medium transition-colors whitespace-nowrap ${
                              sortBy === opt.value
                                ? 'bg-brand-terracotta text-white'
                                : 'text-brand-dark/60 hover:bg-white/80'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
                  {visibleProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {visibleProducts.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-brand-dark/40 text-lg">No products match your current filters.</p>
                    <button
                      onClick={() => setFilters({
                        minPrice: 0,
                        maxPrice: maxPriceLimit,
                        style: null,
                        brand: null,
                        category: null,
                        colors: [],
                        materials: []
                      })}
                      className="mt-4 text-brand-terracotta underline font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="py-12 text-center text-brand-dark/30 text-sm relative z-10">
        <p>© 2026 FurniSnap. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Page;
