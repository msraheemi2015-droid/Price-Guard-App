import { GoogleGenAI } from "@google/genai";
import { ItemData } from '../types';

const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

export const searchItemPrices = async (
  query: string, 
  location?: { latitude: number; longitude: number }
): Promise<ItemData> => {
const modelId = 'gemini-2.0-flash';
  const locationInstruction = location 
    ? `The user is located at Lat: ${location.latitude}, Long: ${location.longitude}. 
       1. Identify the city or region closest to these coordinates.
       2. CRITICAL: You MUST prioritize finding and listing market rates for this specific local city/region FIRST in the 'markets' list.
       3. Then list other major markets in Pakistan.`
    : '';

  const prompt = `
    You are an expert market analyst for PriceGuard, a community-driven price tracking app in Pakistan.
    Search for the current daily market rates for: "${query}".
    ${locationInstruction}
    Focus on major markets in Pakistan (e.g., Lahore Akbari Mandi, Karachi Sabzi Mandi, Islamabad I-11, local grocery stores).
    
    You MUST output the result in a STRICT JSON format inside a code block.
    
    The JSON structure should be:
    {
      "name": "Item Name (English)",
      "nameUr": "Item Name (Urdu script)",
      "category": "Vegetable/Grocery/Fruit (English)",
      "categoryUr": "Category (Urdu script)",
      "averagePrice": 0,
      "description": "Short description of current supply/quality status (English).",
      "descriptionUr": "Short description (Urdu script).",
      "imageUrl": "Find a publicly accessible, direct URL for an image of this item (e.g. from Wikimedia Commons or a royalty-free stock site).",
      "markets": [
        {
          "marketName": "Name of market or Store",
          "city": "City Name (English)",
          "price": 0,
          "yesterdayPrice": 0,
          "lastWeekPrice": 0,
          "unit": "kg/liter/dozen",
          "quality": "Premium/Standard/Fair",
          "trend": "up/down/stable",
          "lastUpdated": "YYYY-MM-DD",
          "reportTime": "HH:MM AM/PM",
          "verified": true,
          "reportedBy": "Name of reporter"
        }
      ],
      "history": [
        { "date": "YYYY-MM-DD (last 5 days)", "price": 0 }
      ]
    }

    Instructions:
    1. Ensure Urdu script (nameUr, categoryUr, descriptionUr) is accurate and helpful.
    2. If exact historical prices are not found, estimate them based on current trends.
    3. Ensure prices are in PKR.
  `;

  try {
    const config: any = {
      tools: [{ googleSearch: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sourceUrls: string[] = [];
    groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) sourceUrls.push(chunk.web.uri);
    });

    const jsonMatch = text?.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error("Failed to parse market data structure.");
    }

    const parsedData = JSON.parse(jsonMatch[1]);
    
    return {
      ...parsedData,
      sourceUrls: [...new Set(sourceUrls)].slice(0, 5)
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
