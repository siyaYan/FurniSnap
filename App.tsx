import React, { useState, useRef } from 'react';
import { Upload, Camera, ImageIcon, ArrowRight, RefreshCw, Github } from 'lucide-react';
import { analyzeFurnitureImage, fileToBase64 } from './services/geminiService';
import { searchSimilarProducts } from './services/mockProductService';
import { LoadingState, AnalysisResult, Product, SearchFilters } from './types';
import LoadingScreen from './components/LoadingScreen';
import ProductCard from './components/ProductCard';
import FilterBar from './components/FilterBar';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ minPrice: 0, maxPrice: 10000, style: null });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      await processImage(file);
    }
  };

  const processImage = async (file: File) => {
    try {
      setLoadingState(LoadingState.UPLOADING);
      const base64 = await fileToBase64(file);
      setPreviewImage(`data:image/jpeg;base64,${base64}`); // Just for preview
      
      setLoadingState(LoadingState.ANALYZING);
      const analysis = await analyzeFurnitureImage(base64);
      setAnalysisResult(analysis);

      setLoadingState(LoadingState.SEARCHING);
      const results = await searchSimilarProducts(analysis);
      setProducts(results);

      setLoadingState(LoadingState.COMPLETE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
      alert("Something went wrong. Please check your API Key.");
    }
  };

  const resetSearch = () => {
    setLoadingState(LoadingState.IDLE);
    setPreviewImage(null);
    setAnalysisResult(null);
    setProducts([]);
  };

  // Filter products based on current filters
  const visibleProducts = products.filter(p => p.price <= filters.maxPrice);

  return (
    <div className="min-h-screen font-sans text-stone-900 bg-stone-50 selection:bg-stone-200">
      
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold font-serif">
              F
            </div>
            <span className="font-semibold text-lg tracking-tight">FurniSnap</span>
          </div>
          <div className="flex items-center gap-4">
             {loadingState === LoadingState.COMPLETE && (
               <button onClick={resetSearch} className="text-stone-500 hover:text-stone-900 transition-colors">
                 <RefreshCw className="w-5 h-5" />
               </button>
             )}
            <a href="#" className="hidden sm:block text-sm font-medium text-stone-500 hover:text-stone-900">Saved</a>
            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen">
        
        {/* State: IDLE (Home Page) */}
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

            {/* Upload Area */}
            <div 
              className="w-full max-w-2xl bg-white rounded-3xl p-2 shadow-2xl shadow-stone-200/50 border border-stone-100 cursor-pointer group hover:border-stone-300 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-64 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center bg-stone-50/50 group-hover:bg-stone-50 transition-colors">
                 <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-stone-800" />
                 </div>
                 <p className="text-stone-900 font-medium">Click to upload or drag & drop</p>
                 <p className="text-stone-400 text-sm mt-1">Supports JPG, PNG, WEBP</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect}
              />
            </div>

            {/* Sample Images */}
            <div className="mt-16 w-full">
              <p className="text-stone-400 text-sm mb-4 font-medium">TRY A SAMPLE</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer"
                       onClick={async () => {
                         // Fetch sample image and process it
                         const res = await fetch(`https://picsum.photos/400/400?random=${i+20}`);
                         const blob = await res.blob();
                         processImage(new File([blob], "sample.jpg", { type: "image/jpeg" }));
                       }}
                  >
                    <img src={`https://picsum.photos/400/400?random=${i+20}`} alt="Sample" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State: PROCESSING */}
        {(loadingState === LoadingState.UPLOADING || loadingState === LoadingState.ANALYZING || loadingState === LoadingState.SEARCHING) && (
           <div className="max-w-2xl mx-auto px-4 pt-32 flex flex-col items-center">
             {previewImage && (
               <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg mb-8 border-4 border-white">
                 <img src={previewImage} alt="Analyzing" className="w-full h-full object-cover" />
               </div>
             )}
             <LoadingScreen step={loadingState as any} />
           </div>
        )}

        {/* State: RESULTS */}
        {loadingState === LoadingState.COMPLETE && analysisResult && (
          <div className="min-h-screen flex flex-col">
            
            {/* Filter Bar */}
            <FilterBar 
              filters={filters} 
              onFilterChange={setFilters} 
              detectedStyle={analysisResult.style} 
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
              
              {/* Analysis Summary Header */}
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
                
                <div className="flex gap-2">
                   {analysisResult.colors.map(color => (
                     <div key={color} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-600">
                       <div className="w-3 h-3 rounded-full bg-stone-400 border border-stone-200" style={{backgroundColor: color.toLowerCase()}}></div>
                       {color}
                     </div>
                   ))}
                </div>
              </div>

              {/* Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
                {visibleProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleProducts.length === 0 && (
                 <div className="py-20 text-center">
                   <p className="text-stone-400 text-lg">No products match your current filters.</p>
                   <button 
                    onClick={() => setFilters({minPrice: 0, maxPrice: 10000, style: null})}
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

export default App;