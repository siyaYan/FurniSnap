'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, History, ExternalLink, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product, AnalysisResult } from '../../types';

interface HistoryEntry {
  id: string;
  timestamp: string;
  analysis: AnalysisResult;
  products: Product[];
}

const formatPrice = (price: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
};

const ProfilePage: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<'liked' | 'history'>('liked');

  useEffect(() => {
    try {
      const liked: Product[] = JSON.parse(localStorage.getItem('furnisnap_liked_products') || '[]');
      setLikedProducts(liked);
    } catch { /* ignore */ }

    try {
      const hist: HistoryEntry[] = JSON.parse(localStorage.getItem('furnisnap_history') || '[]');
      setHistory(hist);
    } catch { /* ignore */ }
  }, []);

  const removeLiked = (id: string) => {
    const updated = likedProducts.filter(p => p.id !== id);
    setLikedProducts(updated);
    localStorage.setItem('furnisnap_liked_products', JSON.stringify(updated));
    const ids = updated.map(p => p.id);
    localStorage.setItem('furnisnap_liked', JSON.stringify(ids));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('furnisnap_history');
  };

  return (
    <div className="min-h-screen bg-brand-beige text-brand-dark relative overflow-hidden">

      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-brand-sage/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-brand-terracotta/10 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Navbar */}
      <nav className="flex items-center gap-4 px-8 py-6 bg-transparent relative z-10">
        <Link href="/" className="text-brand-dark/50 hover:text-brand-terracotta transition-colors" aria-label="Back to home">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-2xl font-semibold text-brand-terracotta">FurniSnap</span>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-brand-dark mb-8"
        >
          My Profile
        </motion.h1>

        {/* Tab switcher */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => setTab('liked')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'liked'
                ? 'bg-brand-terracotta text-white'
                : 'bg-white/60 border border-brand-dark/10 text-brand-dark/70 hover:bg-white/80'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved ({likedProducts.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'history'
                ? 'bg-brand-terracotta text-white'
                : 'bg-white/60 border border-brand-dark/10 text-brand-dark/70 hover:bg-white/80'
            }`}
          >
            <History className="w-4 h-4" />
            History ({history.length})
          </button>
        </div>

        {/* Liked Products */}
        {tab === 'liked' && (
          <>
            {likedProducts.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-brand-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-brand-terracotta/50" />
                </div>
                <p className="text-brand-dark/60 text-lg">No saved products yet.</p>
                <p className="text-brand-dark/40 text-sm mt-1">Heart a product on the results page to save it here.</p>
                <Link href="/" className="inline-block mt-6 px-8 py-3 bg-brand-terracotta text-white rounded-full text-sm font-medium hover:bg-brand-terracotta/90 transition-colors">
                  Start Searching
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
                {likedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.07 }}
                    className="break-inside-avoid mb-6 group"
                  >
                    <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-brand-beige">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={() => removeLiked(product.id)}
                          aria-label={`Remove ${product.title} from saved`}
                          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-brand-terracotta hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-brand-terracotta group-hover:text-white transition-colors" />
                        </button>
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                            product.similarityScore > 90 ? 'bg-brand-sage/90 text-white' : 'bg-brand-dark/60 text-white'
                          }`}>
                            {product.similarityScore}% match
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-brand-dark text-sm mb-1 line-clamp-1">{product.title}</h3>
                      <p className="text-base font-bold text-brand-dark mb-1">{formatPrice(product.price, product.currency)}</p>
                      <p className="text-xs text-brand-dark/40 mb-3">{product.brand}</p>
                      {product.productUrl && product.productUrl.startsWith('http') ? (
                        <a
                          href={product.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-brand-dark hover:bg-brand-terracotta text-white rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          View Product <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="w-full py-2 bg-brand-beige text-brand-dark/30 rounded-2xl text-sm font-medium flex items-center justify-center cursor-not-allowed">
                          No link available
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Search History */}
        {tab === 'history' && (
          <>
            {history.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-brand-sage/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-7 h-7 text-brand-sage" />
                </div>
                <p className="text-brand-dark/60 text-lg">No search history yet.</p>
                <p className="text-brand-dark/40 text-sm mt-1">Your searches will appear here after you snap a photo.</p>
                <Link href="/" className="inline-block mt-6 px-8 py-3 bg-brand-terracotta text-white rounded-full text-sm font-medium hover:bg-brand-terracotta/90 transition-colors">
                  Start Searching
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 text-sm text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Clear history
                  </button>
                </div>
                <div className="space-y-6">
                  {history.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className="bg-white/60 rounded-3xl border border-brand-dark/10 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-brand-dark">
                            {entry.analysis.category} — <span className="text-brand-dark/50 font-normal">{entry.analysis.style}</span>
                          </p>
                          <p className="text-xs text-brand-dark/30 mt-0.5">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' · '}{entry.products.length} results
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {entry.analysis.colors.slice(0, 4).map(color => (
                            <div
                              key={color}
                              className="w-5 h-5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-brand-dark/50 mb-4 line-clamp-2 italic">"{entry.analysis.description}"</p>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {entry.products.slice(0, 6).map(product => (
                          <a
                            key={product.id}
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-20 group"
                            aria-label={product.title}
                          >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-beige mb-1">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <p className="text-[10px] text-brand-dark/40 truncate">{product.brand}</p>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center text-brand-dark/30 text-sm relative z-10">
        <p>© 2026 FurniSnap. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProfilePage;
