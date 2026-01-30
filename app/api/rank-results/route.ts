import { rankProducts } from '../../../lib/server/rankProducts';

// POST /api/rank-results
// Ranks products and returns minimal scoring metadata

export async function POST(req: Request) {
  try {
    // We expect 'products' to have an 'id' or 'productId' when passed here
    const { products, targetStyle } = await req.json();

    if (!Array.isArray(products)) {
       return Response.json({ error: "Products array required" }, { status: 400 });
    }

    const ranked = rankProducts(products, targetStyle);
    return Response.json(ranked);

  } catch (error) {
    return Response.json({ error: "Ranking failed" }, { status: 500 });
  }
}
