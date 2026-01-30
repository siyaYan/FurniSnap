import { fetchShoppingCandidates } from '../../../lib/server/serpapi';
import { createMockCandidates } from '../../../lib/server/mockProducts';

// POST /api/fetch-products
// Simulates calling Bing Visual Search / Google Shopping via SerpAPI

export async function POST(req: Request) {
  try {
    const { imageUrl, category, style } = await req.json();

    // Mocking the aggregator response based on inputs
    // In a real app, 'imageUrl' would be sent to Visual Search APIs
    
    const useMock = process.env.USE_MOCK_PRODUCTS === 'true';
    const products = useMock
      ? createMockCandidates(category, style)
      : await fetchShoppingCandidates(category, style);
    return Response.json(products);

  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
