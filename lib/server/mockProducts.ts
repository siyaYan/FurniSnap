import 'server-only';
import type { RawProductCandidate } from './serpapi';

// Maps the detected category to relevant image search keywords
const categoryKeywords = (category: string): string => {
  const c = category.toLowerCase();
  if (c.includes('sofa') || c.includes('couch'))   return 'sofa,couch';
  if (c.includes('chair'))                          return 'armchair,chair';
  if (c.includes('table') && c.includes('dining'))  return 'dining-table,furniture';
  if (c.includes('table') && c.includes('coffee'))  return 'coffee-table,furniture';
  if (c.includes('table'))                          return 'table,furniture';
  if (c.includes('bed'))                            return 'bed,bedroom';
  if (c.includes('shelf') || c.includes('bookcase')) return 'bookshelf,bookcase';
  if (c.includes('desk'))                           return 'desk,workspace';
  if (c.includes('cabinet') || c.includes('dresser')) return 'cabinet,furniture';
  if (c.includes('ottoman') || c.includes('stool')) return 'ottoman,stool';
  if (c.includes('lamp') || c.includes('light'))   return 'lamp,lighting';
  return 'furniture,interior';
};

// Returns a sibling category so the Category filter has multiple values to test
const relatedCategory = (category: string): string => {
  const c = category.toLowerCase();
  if (c.includes('chair'))                          return 'Sofa';
  if (c.includes('sofa') || c.includes('couch'))   return 'Armchair';
  if (c.includes('table'))                          return 'Desk';
  if (c.includes('bed'))                            return 'Nightstand';
  if (c.includes('shelf') || c.includes('bookcase')) return 'Cabinet';
  if (c.includes('desk'))                           return 'Bookshelf';
  return 'Ottoman';
};

// loremflickr returns real CC-licensed photos for any keyword set.
// The `lock` param makes each URL deterministic (same image every time).
const img = (keywords: string, lock: number) =>
  `https://loremflickr.com/400/500/${keywords}?lock=${lock}`;

export const createMockCandidates = (category: string, style: string): RawProductCandidate[] => {
  const q = (s: string) => encodeURIComponent(s);
  const rel = relatedCategory(category);
  const kw = categoryKeywords(category);
  const relKw = categoryKeywords(rel);

  return [
    // ── HIGH match: title contains both style + category ─────────────────────
    {
      title: `${style} ${category}`,
      image: img(kw, 1),
      url: `https://www.ikea.com/us/en/search/products/?q=${q(style + ' ' + category)}`,
      price: 299,
      currency: 'USD',
      brand: 'IKEA',
      colors: ['Beige', 'White'],
      materials: ['Wood', 'Fabric'],
    },
    {
      title: `Premium ${style} ${category}`,
      image: img(kw, 2),
      url: `https://www.westelm.com/search/results.html?words=${q(style + ' ' + category)}`,
      price: 1499,
      currency: 'USD',
      brand: 'West Elm',
      colors: ['Walnut'],
      materials: ['Solid Wood', 'Leather'],
    },
    {
      title: `${style} ${category} — Designer Pick`,
      image: img(kw, 3),
      url: `https://www.cb2.com/search?query=${q(style + ' ' + category)}`,
      price: 979,
      currency: 'USD',
      brand: 'CB2',
      colors: ['White', 'Gray'],
      materials: ['Steel', 'Wood'],
    },
    {
      title: `Classic ${category} in ${style} Style`,
      image: img(kw, 4),
      url: `https://www.article.com/search?query=${q(style + ' ' + category)}`,
      price: 649,
      currency: 'USD',
      brand: 'Article',
      colors: ['Beige'],
      materials: ['Solid Wood', 'Fabric'],
    },
    {
      title: `${style} Lounge ${category}`,
      image: img(kw, 5),
      url: `https://www.roomandboard.com/search#query=${q(style + ' ' + category)}`,
      price: 1599,
      currency: 'USD',
      brand: 'Room & Board',
      colors: ['Gray', 'Beige'],
      materials: ['Fabric', 'Metal'],
    },
    {
      title: `${style} ${category} — Editor's Choice`,
      image: img(kw, 6),
      url: `https://www.dwr.com/search?q=${q(style + ' ' + category)}`,
      price: 3299,
      currency: 'USD',
      brand: 'Design Within Reach',
      colors: ['Walnut'],
      materials: ['Solid Wood', 'Leather'],
    },

    // ── MEDIUM match: title contains only category ────────────────────────────
    {
      title: `Affordable ${category}`,
      image: img(kw, 7),
      url: `https://www.wayfair.com/keyword.php?keyword=${q(style + ' ' + category)}`,
      price: 149,
      currency: 'USD',
      brand: 'Wayfair',
      colors: ['Black'],
      materials: ['Metal', 'Fabric'],
    },
    {
      title: `Compact ${category} for Small Spaces`,
      image: img(kw, 8),
      url: `https://www.target.com/s?searchTerm=${q(style + ' ' + category)}`,
      price: 89,
      currency: 'USD',
      brand: 'Target',
      colors: ['Black', 'White'],
      materials: ['Engineered Wood'],
    },
    {
      title: `${category} — Budget Find`,
      image: img(kw, 9),
      url: `https://www.overstock.com/search?keywords=${q(style + ' ' + category)}`,
      price: 79,
      currency: 'USD',
      brand: 'Overstock',
      colors: ['Gray'],
      materials: ['Fabric'],
    },
    {
      title: `Luxe Velvet ${category}`,
      image: img(kw, 10),
      url: `https://www.potterybarn.com/search/results.html?words=${q(style + ' ' + category)}`,
      price: 1899,
      currency: 'USD',
      brand: 'Pottery Barn',
      colors: ['Navy'],
      materials: ['Velvet', 'Wood'],
    },

    // ── LOW match: related category, no style word in title ───────────────────
    {
      title: `Marble Top ${rel}`,
      image: img(relKw, 11),
      url: `https://www.crateandbarrel.com/search?query=${q(rel)}`,
      price: 2499,
      currency: 'USD',
      brand: 'Crate & Barrel',
      colors: ['White', 'Black'],
      materials: ['Marble', 'Metal'],
    },
    {
      title: `Modern Accent ${rel}`,
      image: img(relKw, 12),
      url: `https://www.ikea.com/us/en/search/products/?q=${q(rel)}`,
      price: 199,
      currency: 'USD',
      brand: 'IKEA',
      colors: ['White', 'Beige'],
      materials: ['Engineered Wood', 'Metal'],
    },
  ];
};
