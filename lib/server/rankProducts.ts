import 'server-only';
import type { RawProductCandidate } from './serpapi';

export interface RankedProductMeta {
  productId: string;
  similarityScore: number;
  rank: number;
  label: string;
}

export interface RankingContext {
  targetStyle?: string;
  targetCategory?: string;
  targetColors?: string[];
  targetMaterials?: string[];
}

const scoreProduct = (
  p: RawProductCandidate & { id: string },
  context: RankingContext
): number => {
  const titleLower = (p.title || '').toLowerCase();
  const styleLower = (context.targetStyle || '').toLowerCase();
  const categoryLower = (context.targetCategory || '').toLowerCase();
  const colors = context.targetColors || [];
  const materials = context.targetMaterials || [];

  let score = 45; // base — honest floor for a candidate with no matching signals

  // Category match in title: strongest signal (+22)
  if (categoryLower && titleLower.includes(categoryLower)) score += 22;

  // Style match in title (+15)
  if (styleLower && titleLower.includes(styleLower)) score += 15;

  // Color mentions in title (+8 each, capped at +14)
  const colorHits = colors.filter(c => titleLower.includes(c.toLowerCase())).length;
  score += Math.min(colorHits * 8, 14);

  // Material mentions in title (+7 each, capped at +12)
  // Also check product's own colors/materials arrays
  const productColors = p.colors || [];
  const productMaterials = p.materials || [];

  const materialTitleHits = materials.filter(m => titleLower.includes(m.toLowerCase())).length;
  const materialArrayHits = materials.filter(m =>
    productMaterials.some(pm => pm.toLowerCase() === m.toLowerCase())
  ).length;
  score += Math.min((materialTitleHits + materialArrayHits) * 7, 12);

  // Bonus: product's own color array intersects with target colors (+5)
  const colorArrayHits = colors.filter(c =>
    productColors.some(pc => pc.toLowerCase() === c.toLowerCase())
  ).length;
  if (colorArrayHits > 0) score += Math.min(colorArrayHits * 5, 8);

  return Math.min(97, score);
};

export const rankProducts = (
  products: Array<RawProductCandidate & { id: string }>,
  context: RankingContext | string = {}
): RankedProductMeta[] => {
  // Accept legacy string call (targetStyle only) for backward compat with /api/rank-results
  const ctx: RankingContext = typeof context === 'string'
    ? { targetStyle: context }
    : context;

  const ranked = products.map((p, index) => {
    const score = scoreProduct(p, ctx);

    const styleMatches = ctx.targetStyle
      ? (p.title || '').toLowerCase().includes(ctx.targetStyle.toLowerCase())
      : false;

    let label = 'Similar';
    if (score >= 88) label = 'Best Match';
    else if (styleMatches) label = 'Same Style';
    else if (p.price < 500) label = 'Budget Friendly';
    else if (p.price > 1500) label = 'Premium';

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
