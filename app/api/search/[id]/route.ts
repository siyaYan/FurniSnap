import { db } from '../../../lib/db-mock';

// GET /api/search/[id]
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const searchId = params.id;
    
    const search = await db.searches.selectById(searchId);
    
    if (!search) {
      return Response.json({ error: "Search not found" }, { status: 404 });
    }

    const results = await db.searchResults.selectBySearchId(searchId);
    
    // Enrich results with product details + prices
    const enrichedResults = await Promise.all(results.map(async (r) => {
      const product = await db.products.selectByIdWithPrice(r.product_id);
      
      // Map DB structure back to Frontend 'Product' type if needed, 
      // or return full DB object. Here we mix them for convenience.
      return {
        ...r,
        product: product ? {
            ...product,
            imageUrl: product.image_url, // Mapper
            style: product.style_tag // Mapper
        } : null
      };
    }));

    return Response.json({
      search,
      results: enrichedResults
    });

  } catch (error) {
    return Response.json({ error: "Failed to fetch search" }, { status: 500 });
  }
}