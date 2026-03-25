import 'server-only';
import type { RawProductCandidate } from './serpapi';

export const createMockCandidates = (category: string, style: string): RawProductCandidate[] => {
  const q = (terms: string) => encodeURIComponent(terms);
  return [
    {
      title: `${style} ${category}`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
      url: `https://www.ikea.com/us/en/search/products/?q=${q(style + ' ' + category)}`,
      price: 299,
      currency: 'USD',
      brand: 'IKEA',
      colors: ['Beige', 'White'],
      materials: ['Wood', 'Fabric']
    },
    {
      title: `Premium ${category}`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100) + 100}`,
      url: `https://www.westelm.com/search/results.html?words=${q(style + ' ' + category)}`,
      price: 1299,
      currency: 'USD',
      brand: 'West Elm',
      colors: ['Walnut', 'Gray'],
      materials: ['Solid Wood', 'Leather']
    },
    {
      title: `Affordable ${style} Option`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100) + 200}`,
      url: `https://www.wayfair.com/keyword.php?keyword=${q(style + ' ' + category)}`,
      price: 150,
      currency: 'USD',
      brand: 'Wayfair',
      colors: ['Black', 'Beige'],
      materials: ['Metal', 'Fabric']
    },
    {
      title: `${style} ${category} — Designer Pick`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100) + 300}`,
      url: `https://www.cb2.com/search?query=${q(style + ' ' + category)}`,
      price: 899,
      currency: 'USD',
      brand: 'CB2',
      colors: ['White', 'Gray'],
      materials: ['Steel', 'Wood']
    },
    {
      title: `Classic ${category} in ${style} Style`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100) + 400}`,
      url: `https://www.article.com/search?query=${q(style + ' ' + category)}`,
      price: 649,
      currency: 'USD',
      brand: 'Article',
      colors: ['Walnut', 'Beige'],
      materials: ['Solid Wood', 'Fabric']
    },
    {
      title: `${category} — Compact ${style}`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100) + 500}`,
      url: `https://www.target.com/s?searchTerm=${q(style + ' ' + category)}`,
      price: 199,
      currency: 'USD',
      brand: 'Target',
      colors: ['Black', 'White'],
      materials: ['Engineered Wood', 'Metal']
    }
  ];
};
