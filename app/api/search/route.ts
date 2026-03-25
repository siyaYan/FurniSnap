import { db } from '../../../lib/db-mock';
import { analyzeFurnitureImage } from '../../../lib/server/gemini';
import { fetchShoppingCandidates } from '../../../lib/server/serpapi';
import { createMockCandidates } from '../../../lib/server/mockProducts';
import { rankProducts } from '../../../lib/server/rankProducts';

// POST /api/search
// The "Brain" that coordinates the entire flow
export async function POST(req: Request) {
  try {
    const { imageBase64, imageUrl, userId } = await req.json();

    let data = imageBase64;
    if (!data && imageUrl && imageUrl.startsWith('data:image')) {
      data = imageUrl.split(',')[1];
    } else if (!data && imageUrl) {
      return Response.json({ error: 'Image data required (base64 or data URI)' }, { status: 400 });
    }

    if (!data) {
      return Response.json({ error: 'Image data required' }, { status: 400 });
    }

    const analysis = await analyzeFurnitureImage(data);
    
    // 2. Log Search to DB
    const searchRecord = await db.searches.insert({
      user_id: userId,
      image_url: "uploaded_image_placeholder", // Store the S3 url here in prod
      detected_category: analysis.category,
      detected_style: analysis.style,
      detected_tags: { colors: analysis.colors, materials: analysis.materials, description: analysis.description }
    });

    // 3. Fetch Candidates
    const useMock = process.env.USE_MOCK_PRODUCTS === 'true';
    const rawProducts = useMock
      ? createMockCandidates(analysis.category, analysis.style)
      : await fetchShoppingCandidates(analysis.category, analysis.style);

    // 3.1 Assign Temp IDs for Ranking (since fetch-products returns raw data without DB IDs)
    const productsWithIds = rawProducts.map((p: any) => ({
      ...p,
      id: crypto.randomUUID() // Generate ID for DB insertion later
    }));

    // 4. Rank Results
    const rankedMeta = rankProducts(productsWithIds, {
      targetStyle: analysis.style,
      targetCategory: analysis.category,
      targetColors: analysis.colors,
      targetMaterials: analysis.materials
    });

    // 5. Upsert Products into DB (PRODUCTS + PRODUCT_PRICES)
    // We map the raw product data + ranked metadata into our DB schema
    const resultsForResponse: any[] = [];

    const buildTags = (label: string | undefined, price: number, styleMatch: boolean) => {
      const tags = new Set<string>();
      if (label && label !== 'Similar') tags.add(label);
      if (price < 500) tags.add('Budget Friendly');
      if (price > 3000) tags.add('Premium');
      if (styleMatch) tags.add('Same Style');
      return Array.from(tags);
    };

    await Promise.all(productsWithIds.map(async (p: any) => {
      // Find ranking info
      const rankInfo = rankedMeta.find((r: any) => r.productId === p.id);
      
      const styleMatches = analysis.style
        ? (p.title || '').toLowerCase().includes(analysis.style.toLowerCase())
        : false;
      const tags = buildTags(rankInfo?.label, p.price, styleMatches);

      await db.products.upsert({
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: analysis.category,
        style_tag: analysis.style,
        image_url: p.image,      // Map 'image' -> 'image_url'
        product_url: p.url,      // Map 'url' -> 'product_url'
        source_platform: p.brand,
        attributes: { label: rankInfo?.label, tags },
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
            label: rankInfo.label,
            tags,
            style: analysis.style,
            category: analysis.category,
            colors: [] as string[],
            materials: [] as string[]
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

    // Assign staggered color/material subsets so the filter produces varied results.
    // Products that have their own colors (from mock data) keep them; others get a
    // deterministic slice of the analysis colors/materials based on their position.
    resultsForResponse.forEach((item, idx) => {
      const rawProduct = productsWithIds.find((p: any) => p.id === item.id);
      if (rawProduct?.colors && rawProduct.colors.length > 0) {
        item.colors = rawProduct.colors;
      } else {
        item.colors = analysis.colors.filter((_, i) => (i + idx) % 2 === 0);
      }
      if (rawProduct?.materials && rawProduct.materials.length > 0) {
        item.materials = rawProduct.materials;
      } else {
        item.materials = analysis.materials.filter((_, i) => (i + idx) % 2 === 0);
      }
    });

    // Sort results by rank before returning
    resultsForResponse.sort((a, b) => a.rank - b.rank);

    // Return combined result to frontend matching the spec
    return Response.json({
      searchId: searchRecord.id,
      analysis,
      products: resultsForResponse
    });

  } catch (error) {
    console.error("Search Orchestration Failed:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
