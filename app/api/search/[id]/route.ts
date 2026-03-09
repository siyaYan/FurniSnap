import { db } from '@/lib/db-mock';

// GET /api/search/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
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
      const tags = product?.attributes?.tags || (product?.attributes?.label ? [product.attributes.label] : []);
      return {
        ...r,
        product: product ? {
            ...product,
            imageUrl: product.image_url,
            productUrl: product.product_url,
            style: product.style_tag,
            tags
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
