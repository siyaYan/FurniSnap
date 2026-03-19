import React, { useState } from 'react';
import { Product } from '../types';
import { ExternalLink, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [saved, setSaved] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch (e) {
      return `${currency} ${price}`;
    }
  };

  return (
    <div className="group break-inside-avoid mb-6 relative">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100/50">

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setSaved(prev => !prev)}
              aria-label={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
              aria-pressed={saved}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-stone-800"
            >
              <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Similarity Badge */}
          <div className="absolute top-3 left-3">
             <span className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md ${
               product.similarityScore > 90 ? 'bg-green-500/90 text-white' : 'bg-stone-900/60 text-white'
             }`}>
               {product.similarityScore}% match
             </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-stone-900 text-lg leading-tight truncate pr-2">{product.title}</h3>
            <span className="font-semibold text-stone-900">{formatPrice(product.price, product.currency)}</span>
          </div>

          <p className="text-sm text-stone-500 mb-3">{product.brand}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] uppercase tracking-wider rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${product.title} on retailer site`}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            View Product <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
