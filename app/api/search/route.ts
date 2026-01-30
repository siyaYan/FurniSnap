import { db } from '../../../lib/db-mock';

// POST /api/search
// The "Brain" that coordinates the entire flow
export async function POST(req: Request) {
  try {
    const { imageUrl, userId } = await req.json();
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 1. Analyze Image
    // Note: In a real app, imageUrl might be a remote URL. 
    // Here we treat it as the data source (potentially dataURI).
    const analysisRes = await fetch(`${baseUrl}/api/analyze-image`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl })
    });
    const analysis = await analysisRes.json();
    
    // 2. Log Search to DB
    const searchRecord = await db.searches.insert({
      user_id: userId,
      image_url: "uploaded_image_placeholder", // Store the S3 url here in prod
      detected_category: analysis.category,
      detected_style: analysis.style,
      detected_tags: { tags: analysis.tags, colors: analysis.colors, materials: analysis.materials }
    });

    // 3. Fetch Candidates
    const fetchRes = await fetch(`${baseUrl}/api/fetch-products`, {
      method: 'POST',
      body: JSON.stringify({ 
        imageUrl: imageUrl,
        category: analysis.category, 
        style: analysis.style
      })
    });
    const rawProducts = await fetchRes.json();

    // 3.1 Assign Temp IDs for Ranking (since fetch-products returns raw data without DB IDs)
    const productsWithIds = rawProducts.map((p: any) => ({
      ...p,
      id: crypto.randomUUID() // Generate ID for DB insertion later
    }));

    // 4. Rank Results
    const rankRes = await fetch(`${baseUrl}/api/rank-results`, {
      method: 'POST',
      body: JSON.stringify({
        products: productsWithIds,
        targetStyle: analysis.style
      })
    });
    const rankedMeta = await rankRes.json();

    // 5. Upsert Products into DB (PRODUCTS + PRODUCT_PRICES)
    // We map the raw product data + ranked metadata into our DB schema
    const resultsForResponse: any[] = [];

    await Promise.all(productsWithIds.map(async (p: any) => {
      // Find ranking info
      const rankInfo = rankedMeta.find((r: any) => r.productId === p.id);
      
      const dbProduct = await db.products.upsert({
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: analysis.category,
        style_tag: analysis.style,
        image_url: p.image,      // Map 'image' -> 'image_url'
        product_url: p.url,      // Map 'url' -> 'product_url'
        source_platform: p.brand,
        attributes: { label: rankInfo?.label }, 
        price: p.price,
        currency: p.currency || "USD"
      });

      // Prepare the enriched result object for the response
      if (rankInfo) {
        resultsForResponse.push({
            // Flattened structure or detailed structure? 
            // The prompt example says "results": [...]. 
            // Usually this includes product info for the UI.
            // We'll return the merged view.
            id: p.id,
            title: p.title,
            brand: p.brand,
            price: p.price,
            currency: p.currency || "USD",
            imageUrl: p.image,
            productUrl: p.url,
            similarityScore: rankInfo.similarityScore,
            rank: rankInfo.rank,
            label: rankInfo.label
        });
      }
    }));

    // 6. Store Search Results Association
    await db.searchResults.insert(rankedMeta.map((r: any) => ({
      search_id: searchRecord.id,
      product_id: r.productId,
      similarity_score: r.similarityScore,
      rank_position: r.rank
    })));

    // Sort results by rank before returning
    resultsForResponse.sort((a, b) => a.rank - b.rank);

    // Return combined result to frontend matching the spec
    return Response.json({
      searchId: searchRecord.id,
      detectedCategory: analysis.category,
      detectedStyle: analysis.style,
      results: resultsForResponse
    });

  } catch (error) {
    console.error("Search Orchestration Failed:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}