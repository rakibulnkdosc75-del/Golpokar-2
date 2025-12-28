
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StorySettings, StoryType } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateStoryStream = async (
  settings: StorySettings,
  onChunk: (chunk: string) => void
) => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are a world-class Bengali author (Sahityik) like Humayun Ahmed, Rabindranath Tagore, or Sarat Chandra Chattopadhyay. 
  Your goal is to write high-quality, emotionally resonant, and grammatically perfect Bengali literature.
  
  ${settings.isMature ? "Target Audience: Adults (18+). You may include mature themes, psychological complexity, complex human relationships, and adult situations where appropriate for the narrative. Maintain artistic integrity." : "Target Audience: General. Keep the content family-friendly and avoid explicit or offensive themes."}
  
  Respond ONLY with the story content in Bengali. Do not include English explanations unless absolutely necessary for a character.`;

  const prompt = `Write a ${settings.type} in the ${settings.genre} genre.
  Title: ${settings.title || "A Beautiful Bengali Tale"}
  Length Requirement: ${settings.length === 'short' ? 'Brief and concise' : settings.length === 'medium' ? 'Detailed and immersive' : 'Extremely detailed, long, and novel-like structure'}.
  
  Please start the story now in Bengali:`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate story. Please try again.");
  }
};
