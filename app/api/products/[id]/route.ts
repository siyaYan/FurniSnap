import { db } from '../../../lib/db-mock';

// GET /api/products/[id]
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    // Returns joined product + price data
    const product = await db.products.selectByIdWithPrice(params.id);

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}