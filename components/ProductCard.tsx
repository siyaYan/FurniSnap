'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ExternalLink, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const LIKED_KEY = 'furnisnap_liked';

const getLikedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
  } catch {
    return [];
  }
};

const setLikedIds = (ids: string[]) => {
  localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getLikedIds().includes(product.id));
  }, [product.id]);

  const toggleSaved = () => {
    const ids = getLikedIds();
    const next = ids.includes(product.id)
      ? ids.filter(id => id !== product.id)
      : [...ids, product.id];
    setLikedIds(next);

    try {
      const savedProducts: Product[] = JSON.parse(localStorage.getItem('furnisnap_liked_products') || '[]');
      const updated = next.includes(product.id)
        ? [...savedProducts.filter(p => p.id !== product.id), product]
        : savedProducts.filter(p => p.id !== product.id);
      localStorage.setItem('furnisnap_liked_products', JSON.stringify(updated));
    } catch { /* ignore */ }

    setSaved(next.includes(product.id));
  };

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="break-inside-avoid mb-6 group"
    >
      <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-brand-beige">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Match badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
              product.similarityScore > 90
                ? 'bg-brand-sage/90 text-white'
                : 'bg-brand-dark/60 text-white'
            }`}>
              {product.similarityScore}% match
            </span>
          </div>

          {/* Heart button */}
          <button
            onClick={toggleSaved}
            aria-label={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
            aria-pressed={saved}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-brand-terracotta transition-colors group/heart"
          >
            <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-brand-terracotta text-brand-terracotta' : 'text-brand-terracotta group-hover/heart:text-white'}`} />
          </button>
        </div>

        <h3 className="font-medium text-brand-dark mb-1 line-clamp-1 text-sm">{product.title}</h3>
        <p className="text-base font-bold text-brand-dark mb-1">{formatPrice(product.price, product.currency)}</p>
        <p className="text-xs text-brand-dark/40 mb-3">{product.brand}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-brand-sage/10 text-brand-dark/60 text-[10px] uppercase tracking-wider rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {product.productUrl && product.productUrl.startsWith('http') ? (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${product.title} on retailer site`}
            className="w-full py-2.5 bg-brand-dark hover:bg-brand-terracotta text-white rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            View Product <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        ) : (
          <span className="w-full py-2.5 bg-brand-beige text-brand-dark/30 rounded-2xl text-sm font-medium flex items-center justify-center cursor-not-allowed">
            No link available
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
