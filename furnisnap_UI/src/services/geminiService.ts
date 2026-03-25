import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function identifyFurniture(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Identify the main furniture item in this image and its interior design style. Return only a short phrase like 'Side Table in Modern Minimalist style'." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
          ],
        },
      ],
    });

    return response.text || "Furniture in contemporary style";
  } catch (error) {
    console.error("Error identifying furniture:", error);
    return "Furniture in contemporary style";
  }
}
