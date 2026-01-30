import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:image/png;base64, prefix
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeFurnitureImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is missing from environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyze this image of furniture. 
      Identify the main furniture piece, its style (e.g., Scandinavian, Mid-Century, Industrial, Japandi, Modern), 
      dominant colors, and visible materials.
      Provide a short visual description.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, API handles png too
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "The type of furniture, e.g., Sofa, Chair, Table" },
            style: { type: Type.STRING, description: "The design style, e.g., Scandinavian, Modern" },
            colors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of dominant colors"
            },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of visible materials"
            },
            description: { type: Type.STRING, description: "A brief visual description" }
          },
          required: ["category", "style", "colors", "materials", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails or key is invalid
    return {
      category: "Furniture",
      style: "Modern",
      colors: ["Neutral"],
      materials: ["Unknown"],
      description: "Could not analyze image. Using default fallback."
    };
  }
};