import { db } from '../../lib/db-mock';

// GET /api/products
export async function GET(req: Request) {
  try {
    // Returns joined product + price data
    const products = await db.products.listWithPrice();
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products (Admin/System use)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageUrl = body.image_url || body.imageUrl;
    if (!body.title || !imageUrl) {
      return Response.json({ error: "Missing required product fields" }, { status: 400 });
    }
    
    // Handles insert into PRODUCTS and PRODUCT_PRICES
    const product = await db.products.upsert({
        ...body,
        style_tag: body.style_tag || body.style, // Accept 'style' from input but save as 'style_tag'
        image_url: imageUrl
    });
    
    return Response.json(product, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
