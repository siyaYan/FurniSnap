import { analyzeFurnitureImage } from '../../../lib/server/gemini';

// POST /api/analyze-image
export async function POST(req: Request) {
  try {
    const { imageBase64, imageUrl } = await req.json();

    // Support both raw base64 or data URL
    let data = imageBase64;
    if (!data && imageUrl && imageUrl.startsWith('data:image')) {
      data = imageUrl.split(',')[1];
    } else if (!data && imageUrl) {
      // If it's a real URL, we might need to fetch it (not implemented here for mock simplicity),
      // or assume the client sends base64 for now as per previous logic.
      // For this implementation, we expect the client to send data uri in 'imageUrl' or base64 in 'imageBase64'
      return Response.json({ error: "Image data required (base64 or data URI)" }, { status: 400 });
    }

    if (!data) {
       return Response.json({ error: "Image data required" }, { status: 400 });
    }

    const analysis = await analyzeFurnitureImage(data);

    return Response.json(analysis);

  } catch (error) {
    console.error("API Analyze Error:", error);
    return Response.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
