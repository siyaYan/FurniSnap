import { db } from '@/lib/db-mock';

// GET /api/products/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Returns joined product + price data
    const { id } = await params;
    const product = await db.products.selectByIdWithPrice(id);

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
