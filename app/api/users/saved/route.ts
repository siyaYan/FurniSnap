import { db } from '../../../../lib/db-mock';

// GET /api/users/saved?userId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return Response.json({ error: "User ID required" }, { status: 400 });

  const items = await db.savedItems.select(userId);
  return Response.json(items);
}

// POST /api/users/saved
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, productId } = body;

  if (!userId || !productId) {
    return Response.json({ error: "Missing data" }, { status: 400 });
  }

  const saved = await db.savedItems.insert({ user_id: userId, product_id: productId });
  return Response.json(saved);
}