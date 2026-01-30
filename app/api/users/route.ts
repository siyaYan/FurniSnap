import { db } from '../../lib/db-mock';

// POST /api/users - Create or Update user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const user = await db.users.createOrUpdate({
      id: body.id, // Optional, can be provided by Auth provider
      email: body.email,
      name: body.name
    });

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: "Failed to manage user" }, { status: 500 });
  }
}