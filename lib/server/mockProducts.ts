import 'server-only';
import type { RawProductCandidate } from './serpapi';

export const createMockCandidates = (category: string, style: string): RawProductCandidate[] => {
  return [
    {
      title: `${style} ${category}`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
      url: 'https://ikea.com/product/1',
      price: 299,
      currency: 'USD',
      brand: 'IKEA'
    },
    {
      title: `Premium ${category}`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
      url: 'https://westelm.com/product/2',
      price: 1299,
      currency: 'USD',
      brand: 'West Elm'
    },
    {
      title: `Affordable ${style} Option`,
      image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
      url: 'https://wayfair.com/product/3',
      price: 150,
      currency: 'USD',
      brand: 'Wayfair'
    }
  ];
};
