// POST /api/rank-results
// Ranks products and returns minimal scoring metadata

export async function POST(req: Request) {
  try {
    // We expect 'products' to have an 'id' or 'productId' when passed here
    const { products, targetStyle } = await req.json();

    if (!Array.isArray(products)) {
       return Response.json({ error: "Products array required" }, { status: 400 });
    }

    const ranked = products.map((p, index) => {
      // Mock ranking logic
      let score = 0.7; 
      if (p.title && targetStyle && p.title.toLowerCase().includes(targetStyle.toLowerCase())) {
        score += 0.2;
      }
      score += (Math.random() * 0.1);
      score = Math.min(0.99, score);

      // Determine label
      let label = "";
      if (score > 0.9) label = "Best Match";
      else if (p.price < 500) label = "Cheaper";
      else if (p.price > 1000) label = "Premium";
      else label = "Similar";

      return {
        productId: p.id || p.productId || `temp_${index}`, // Ensure ID exists
        similarityScore: Number(score.toFixed(2)),
        rank: 0, // Will set after sort
        label: label
      };
    });

    // Sort by score descending
    ranked.sort((a, b) => b.similarityScore - a.similarityScore);

    // Update rank position
    ranked.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return Response.json(ranked);

  } catch (error) {
    return Response.json({ error: "Ranking failed" }, { status: 500 });
  }
}