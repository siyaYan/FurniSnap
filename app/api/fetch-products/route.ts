// POST /api/fetch-products
// Simulates calling Bing Visual Search / Google Shopping via SerpAPI

export async function POST(req: Request) {
  try {
    const { imageUrl, category, style } = await req.json();

    // Mocking the aggregator response based on inputs
    // In a real app, 'imageUrl' would be sent to Visual Search APIs
    
    const mockProducts = [
      {
        title: `${style} ${category}`,
        image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
        url: "https://ikea.com/product/1",
        price: 299,
        currency: "USD",
        brand: "IKEA"
      },
      {
        title: `Premium ${category}`,
        image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
        url: "https://westelm.com/product/2",
        price: 1299,
        currency: "USD",
        brand: "West Elm"
      },
      {
        title: `Affordable ${style} Option`,
        image: `https://picsum.photos/400/500?random=${Math.floor(Math.random() * 100)}`,
        url: "https://wayfair.com/product/3",
        price: 150,
        currency: "USD",
        brand: "Wayfair"
      }
    ];

    return Response.json(mockProducts);

  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}