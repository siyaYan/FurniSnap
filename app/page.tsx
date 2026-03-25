'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, RefreshCw, AlertCircle, User, ArrowUpDown } from 'lucide-react';
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

      // Persist search to history in localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('furnisnap_history') || '[]');
        const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), analysis, products: results };
        const updated = [entry, ...existing].slice(0, 20); // keep last 20
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
  // Derive from actual product data so filter chips always match what products have
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
    return b.similarityScore - a.similarityScore; // 'score' default
  });

  return (
    <div className="min-h-screen font-sans text-stone-900 bg-stone-50 selection:bg-stone-200">
      <nav className="fixed w-full top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && resetSearch()} aria-label="FurniSnap home">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold font-serif">
              F
            </div>
            <span className="font-semibold text-lg tracking-tight">FurniSnap</span>
          </div>
          <div className="flex items-center gap-4">
            {loadingState === LoadingState.COMPLETE && (
              <button onClick={resetSearch} className="text-stone-500 hover:text-stone-900 transition-colors" aria-label="Start a new search">
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <Link href="/profile" aria-label="View profile">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
                <User className="w-4 h-4 text-stone-600" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16 min-h-screen">
        {/* ERROR STATE */}
        {loadingState === LoadingState.ERROR && (
          <div className="max-w-2xl mx-auto px-4 pt-32 flex flex-col items-center text-center" role="alert" aria-live="assertive">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Something went wrong</h2>
            <p className="text-stone-500 mb-6">{errorMessage}</p>
            <button
              onClick={resetSearch}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loadingState === LoadingState.IDLE && (
          <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 flex flex-col items-center text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-medium uppercase tracking-widest mb-6 border border-stone-200">
              AI-Powered Discovery
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight mb-6 leading-[1.1]">
              Snap a space.<br />
              <span className="text-stone-400">Find your style.</span>
            </h1>
            <p className="text-lg text-stone-600 mb-10 max-w-xl leading-relaxed">
              Upload an image of any furniture. Our AI identifies the style and finds similar products across retailers instantly.
            </p>

            <div
              className="w-full max-w-2xl bg-white rounded-3xl p-2 shadow-2xl shadow-stone-200/50 border border-stone-100 cursor-pointer group hover:border-stone-300 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload a furniture image"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div className="h-64 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center bg-stone-50/50 group-hover:bg-stone-50 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-stone-800" aria-hidden="true" />
                </div>
                <p className="text-stone-900 font-medium">Click to upload or drag & drop</p>
                <p className="text-stone-400 text-sm mt-1">Supports JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                aria-label="Select image file"
              />
            </div>

            <div className="mt-16 w-full">
              <p className="text-stone-400 text-sm mb-4 font-medium">TRY A SAMPLE</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer"
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
                    <img
                      src={`https://picsum.photos/400/400?random=${i + 20}`}
                      alt={`Sample furniture ${i}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(loadingState === LoadingState.UPLOADING || loadingState === LoadingState.ANALYZING || loadingState === LoadingState.SEARCHING) && (
          <div className="max-w-2xl mx-auto px-4 pt-32 flex flex-col items-center" aria-live="polite" aria-atomic="true">
            {previewImage && (
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg mb-8 border-4 border-white">
                <img src={previewImage} alt="Uploaded furniture being analyzed" className="w-full h-full object-cover" />
              </div>
            )}
            <LoadingScreen step={loadingState as 'UPLOADING' | 'ANALYZING' | 'SEARCHING'} />
          </div>
        )}

        {loadingState === LoadingState.COMPLETE && analysisResult && (
          <div className="min-h-screen flex flex-col">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-2">
                    Found {visibleProducts.length} Matches
                  </h2>
                  <p className="text-stone-500">
                    Identified: <span className="font-semibold text-stone-800">{analysisResult.category}</span> in <span className="font-semibold text-stone-800">{analysisResult.style}</span> style.
                  </p>
                  <p className="text-sm text-stone-400 mt-1 max-w-2xl">
                    "{analysisResult.description}"
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-2 flex-wrap" aria-label="Detected colors">
                    {analysisResult.colors.map(color => (
                      <div key={color} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-600">
                        <div className="w-3 h-3 rounded-full bg-stone-400 border border-stone-200" style={{ backgroundColor: color.toLowerCase() }} aria-hidden="true"></div>
                        {color}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <ArrowUpDown className="w-4 h-4 text-stone-400" aria-hidden="true" />
                    <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden text-sm" role="group" aria-label="Sort results">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          aria-pressed={sortBy === opt.value}
                          className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${
                            sortBy === opt.value
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-500 hover:bg-stone-50'
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
                {visibleProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-stone-400 text-lg">No products match your current filters.</p>
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
                    className="mt-4 text-stone-900 underline font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Page;
