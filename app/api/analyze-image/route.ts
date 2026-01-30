import { GoogleGenAI, Type } from "@google/genai";

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

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server API Key missing" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyze this furniture image.
      Identify category (e.g. Sofa, Coffee Table), style (e.g. Scandinavian, Industrial).
      Generate descriptive tags for visual features (e.g. materials, shapes, colors).
      Return a structured JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            style: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Visual feature tags like 'light wood', 'round edges', 'minimal'"
            }
          },
          required: ["category", "style", "tags"]
        }
      }
    });

    const analysis = JSON.parse(response.text || "{}");
    
    // Ensure strict response format
    return Response.json({
      category: analysis.category,
      style: analysis.style,
      tags: analysis.tags
    });

  } catch (error) {
    console.error("API Analyze Error:", error);
    return Response.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}