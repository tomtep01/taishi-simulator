import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize Gemini
// NOTE: In a production app, never expose keys on client. 
// For this demo structure, we use process.env as requested.
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const getDealerCommentary = async (
  diceSum: number, 
  winner: string, 
  isTriple: boolean
): Promise<string> => {
  if (!ai) return "Nhà cái đang bận đếm tiền...";

  try {
    const prompt = `Result: ${diceSum} (${winner}). Triple: ${isTriple}. Comment in Vietnamese.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 50, // Keep it short
        thinkingConfig: { thinkingBudget: 0 } // Speed is key for a game
      }
    });

    return response.text?.trim() || "Cược đi bà con ơi!";
  } catch (error) {
    console.error("Dealer fell asleep:", error);
    return "Mạng lag quá, tiếp tục nào!";
  }
};
