import 'server-only';
import type { RawProductCandidate } from './serpapi';

export interface RankedProductMeta {
  productId: string;
  similarityScore: number;
  rank: number;
  label: string;
}

export const rankProducts = (products: Array<RawProductCandidate & { id: string }>, targetStyle?: string): RankedProductMeta[] => {
  const ranked = products.map((p, index) => {
    let score = 70 + Math.random() * 20;
    if (p.title && targetStyle && p.title.toLowerCase().includes(targetStyle.toLowerCase())) {
      score += 10;
    }
    score = Math.min(98, score);

    let label = 'Similar';
    if (score > 90) label = 'Best Match';
    else if (p.price < 500) label = 'Budget Friendly';
    else if (p.price > 1000) label = 'Premium';

    return {
      productId: p.id || `temp_${index}`,
      similarityScore: Math.round(score),
      rank: 0,
      label
    };
  });

  ranked.sort((a, b) => b.similarityScore - a.similarityScore);
  ranked.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return ranked;
};
