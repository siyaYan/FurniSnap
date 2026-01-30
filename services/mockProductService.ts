import { Product, AnalysisResult } from "../types";

// A small database of mock furniture
const MOCK_DB: Partial<Product>[] = [
  { title: "Strandmon Wing Chair", brand: "IKEA", price: 299, currency: "USD", category: "Chair", style: "Traditional", imageUrl: "https://picsum.photos/400/500?random=1" },
  { title: "Eames Lounge Chair", brand: "Herman Miller", price: 6500, currency: "USD", category: "Chair", style: "Mid-Century Modern", imageUrl: "https://picsum.photos/400/400?random=2" },
  { title: "Noguchi Table", brand: "Herman Miller", price: 2195, currency: "USD", category: "Table", style: "Mid-Century Modern", imageUrl: "https://picsum.photos/500/300?random=3" },
  { title: "Stockholm Sofa", brand: "IKEA", price: 1200, currency: "USD", category: "Sofa", style: "Modern", imageUrl: "https://picsum.photos/600/400?random=4" },
  { title: "Tulip Dining Table", brand: "Knoll", price: 3400, currency: "USD", category: "Table", style: "Mid-Century Modern", imageUrl: "https://picsum.photos/400/400?random=5" },
  { title: "Wishbone Chair", brand: "Carl Hansen", price: 850, currency: "USD", category: "Chair", style: "Scandinavian", imageUrl: "https://picsum.photos/300/400?random=6" },
  { title: "Cloud Sofa", brand: "Restoration Hardware", price: 4500, currency: "USD", category: "Sofa", style: "Contemporary", imageUrl: "https://picsum.photos/600/400?random=7" },
  { title: "Poäng Armchair", brand: "IKEA", price: 149, currency: "USD", category: "Chair", style: "Scandinavian", imageUrl: "https://picsum.photos/300/450?random=8" },
  { title: "Arc Lamp", brand: "Flos", price: 3200, currency: "USD", category: "Lighting", style: "Modern", imageUrl: "https://picsum.photos/300/500?random=9" },
  { title: "Billy Bookcase", brand: "IKEA", price: 89, currency: "USD", category: "Storage", style: "Modern", imageUrl: "https://picsum.photos/300/600?random=10" },
  { title: "Barcelona Chair", brand: "Knoll", price: 7800, currency: "USD", category: "Chair", style: "Modern", imageUrl: "https://picsum.photos/400/400?random=11" },
  { title: "Lisle Sofa", brand: "West Elm", price: 1499, currency: "USD", category: "Sofa", style: "Mid-Century Modern", imageUrl: "https://picsum.photos/500/350?random=12" },
];

export const searchSimilarProducts = async (analysis: AnalysisResult): Promise<Product[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Filter loosely based on category (if it matches partially)
  let filtered = MOCK_DB.filter(p => 
    p.category?.toLowerCase().includes(analysis.category.toLowerCase()) || 
    analysis.category.toLowerCase().includes(p.category?.toLowerCase() || '')
  );

  // If no category match, return everything
  if (filtered.length === 0) filtered = [...MOCK_DB];

  // Map to full Product type with generated similarity scores
  return filtered.map(p => {
    // Generate a random similarity score between 70% and 98%
    const score = Math.floor(Math.random() * (98 - 70 + 1) + 70);
    
    // Determine tags
    const tags: string[] = [];
    if (score > 90) tags.push("Best Match");
    if (p.price && p.price < 500) tags.push("Budget Friendly");
    if (p.price && p.price > 3000) tags.push("Premium");
    if (p.style === analysis.style) tags.push("Same Style");

    return {
      id: crypto.randomUUID(),
      title: p.title || "Unknown Item",
      price: p.price || 0,
      currency: p.currency || "USD",
      brand: p.brand || "Generic",
      imageUrl: p.imageUrl || "",
      productUrl: "#",
      similarityScore: score,
      tags: tags,
      style: p.style || "Modern",
      category: p.category || "Furniture"
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
};