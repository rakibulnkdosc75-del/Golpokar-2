import { GoogleGenAI } from "@google/genai";
import { StorySettings, WritingStyle } from "../types";

const API_KEY = process.env.API_KEY || "";

export const ERROR_CODES = {
  MISSING_API_KEY: 'ERR_AUTH_01',
  SAFETY_BLOCKED: 'ERR_SAFE_02',
  QUOTA_EXCEEDED: 'ERR_LIMIT_03',
  NETWORK_ISSUE: 'ERR_NET_04',
  SERVER_ERROR: 'ERR_SRV_05',
  UNKNOWN: 'ERR_UNK_99'
};

export class StoryGenerationError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'StoryGenerationError';
  }
}

const getStyleInstruction = (style: WritingStyle) => {
  switch (style) {
    case WritingStyle.CLASSIC:
      return "Use a classic, formal Bengali literary style (Sadhubhasha elements or high-standard Cholitobhasha). Rich vocabulary and complex sentence structures.";
    case WritingStyle.MODERN:
      return "Use a modern, contemporary, and conversational Bengali style (Cholitobhasha). Natural dialogues and accessible language.";
    case WritingStyle.POETIC:
      return "Use a poetic, metaphorical, and rhythmic prose style. Focus on vivid imagery.";
    case WritingStyle.DRAMATIC:
      return "Use a high-tension, dramatic style with sharp dialogues and intense emotional beats.";
    case WritingStyle.HUMOROUS:
      return "Use a light-hearted, witty, and funny writing style. Focus on clever wordplay.";
    case WritingStyle.SATIRICAL:
      return "Use a sharp, satirical style. Employ irony and sarcasm to critique society.";
    case WritingStyle.HISTORICAL:
      return "Use a period-appropriate historical style with archaic Bengali terms.";
    default:
      return "High-quality Bengali literature style.";
  }
};

export const generateStoryStream = async (
  settings: StorySettings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  existingContent?: string
) => {
  if (!API_KEY) {
    throw new StoryGenerationError("API Key missing.", ERROR_CODES.MISSING_API_KEY);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are a world-class Bengali author (Sahityik). 
  Write high-quality, emotionally resonant Bengali literature.
  Style: ${getStyleInstruction(settings.style)}
  ${settings.isMature ? "Target: Adults (18+). Mature themes allowed. Maintain artistic integrity." : "Target: General audience. Family-friendly."}
  Respond ONLY with Bengali story text. No English.`;

  const prompt = existingContent 
    ? `Based on the following existing story content, continue the story seamlessly. Keep the characters and tone consistent.
       ${settings.plotHint ? `Current Plot Context/Direction: ${settings.plotHint}` : ''}
       --- EXISTING CONTENT ---
       ${existingContent}
       --- CONTINUE WRITING NOW ---`
    : `Write a ${settings.type} titled "${settings.title || "গল্প"}" in the ${settings.genre} genre. 
       ${settings.plotHint ? `Specific Plot/Context to include: ${settings.plotHint}` : ''}
       Length requirement: ${settings.length}. Start the story now in Bengali:`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    for await (const chunk of result) {
      if (signal?.aborted) break;
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    console.error("Gemini Error:", error);
    let message = "গল্প তৈরি করতে সমস্যা হয়েছে।";
    let code = ERROR_CODES.UNKNOWN;
    const errStr = error?.message?.toLowerCase() || "";
    if (errStr.includes("safety")) { message = "নিরাপত্তা ফিল্টারের কারণে তৈরি করা সম্ভব হয়নি।"; code = ERROR_CODES.SAFETY_BLOCKED; }
    else if (errStr.includes("quota") || errStr.includes("429")) { message = "অনেক বেশি রিকোয়েস্ট পাঠানো হয়েছে।"; code = ERROR_CODES.QUOTA_EXCEEDED; }
    throw new StoryGenerationError(message, code);
  }
};