import { GoogleGenAI } from "@google/genai";
import { StorySettings, WritingStyle } from "../types";

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

/**
 * Truncates content to fit within context window while keeping the most relevant part (the end).
 */
const getRelevantContext = (content: string, maxChars = 12000) => {
  if (content.length <= maxChars) return content;
  return "[...পুরানো অংশ...] " + content.slice(-maxChars);
};

export const generateStoryStream = async (
  settings: StorySettings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  existingContent?: string
) => {
  // Always use process.env.API_KEY directly as per requirements
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new StoryGenerationError("API Key missing.", ERROR_CODES.MISSING_API_KEY);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const continuityInstruction = settings.continuityMode === 'strict' 
    ? "Maintain strict continuity. Do NOT contradict established plot points, character names, or settings from previous sections. Logic and consistency are paramount."
    : "Feel free to take creative liberties. You can introduce unexpected twists or evolve the story in surprising ways even if it deviates from a linear path.";

  const matureInstruction = settings.isMature 
    ? "Target: Adults (18+). You are permitted to explore mature, complex, and dark themes where appropriate for the narrative. Maintain literary and artistic integrity. Focus on deep psychological realism and intense human emotions." 
    : "Target: General audience. Ensure the content remains family-friendly, avoiding any explicit or highly sensitive themes.";

  const systemInstruction = `You are an acclaimed Bengali novelist and storyteller (Sahityik). 
  Write high-quality, emotionally resonant literature in Bengali.
  Style: ${getStyleInstruction(settings.style)}
  Continuity Mode: ${continuityInstruction}
  Safety & Audience: ${matureInstruction}
  Respond ONLY with Bengali story text. No English. No conversational filler. No meta-commentary.`;

  const context = existingContent ? getRelevantContext(existingContent) : "";
  
  const prompt = existingContent 
    ? `You are writing a ${settings.type} titled "${settings.title || "গল্প"}". 
       Below is the previous part of the story. Please CONTINUE the story seamlessly from where it left off. 
       Do NOT repeat the existing text. Write the next logical segment.
       ${settings.plotHint ? `Next direction/event: ${settings.plotHint}` : ''}
       
       --- PREVIOUS PART ---
       ${context}
       --- END OF PREVIOUS PART ---
       
       CONTINUE NOW:`
    : `Write a ${settings.type} titled "${settings.title || "নতুন গল্প"}" in the ${settings.genre} genre. 
       ${settings.plotHint ? `Specific Context/Plot: ${settings.plotHint}` : ''}
       Desired Story length: ${settings.length}. 
       Begin the story now:`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: settings.continuityMode === 'strict' ? 0.6 : 0.85,
        topP: 0.95,
      },
    });

    for await (const chunk of result) {
      if (signal?.aborted) break;
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    console.error("Gemini Generation Error:", error);
    
    let message = "গল্প তৈরি করতে সমস্যা হয়েছে।";
    let code = ERROR_CODES.UNKNOWN;
    const errStr = (error?.message || "").toLowerCase();
    
    if (errStr.includes("safety")) { 
      message = "নিরাপত্তা ফিল্টারের কারণে কন্টেন্ট জেনারেট করা সম্ভব হয়নি। সম্ভবত কন্টেন্ট খুব বেশি স্পর্শকাতর হয়ে গিয়েছে।"; 
      code = ERROR_CODES.SAFETY_BLOCKED; 
    } else if (errStr.includes("quota") || errStr.includes("429")) { 
      message = "কোটা শেষ হয়ে গিয়েছে বা অনেক রিকোয়েস্ট পাঠানো হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।"; 
      code = ERROR_CODES.QUOTA_EXCEEDED; 
    } else if (errStr.includes("network") || errStr.includes("fetch")) {
      message = "নেটওয়ার্ক কানেকশনে সমস্যা হচ্ছে। দয়া করে আপনার ইন্টারনেট চেক করুন।";
      code = ERROR_CODES.NETWORK_ISSUE;
    }
    
    throw new StoryGenerationError(message, code);
  }
};