
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new StoryGenerationError("API Key missing.", ERROR_CODES.MISSING_API_KEY);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const continuityInstruction = settings.continuityMode === 'strict' 
    ? "Maintain strict continuity. Do NOT contradict established plot points, character names, or settings from previous sections. Logic and consistency are paramount."
    : "Feel free to take creative liberties. You can introduce unexpected twists or evolve the story in surprising ways even if it deviates from a linear path.";

  const matureInstruction = settings.isMature 
    ? "TARGET AUDIENCE: 18+ (Adults). You are granted full artistic freedom to explore mature, graphic, and intense human themes. This includes romantic intimacy, psychological darkness, social realism, and complex adult relationships. Do not censor mature content; instead, treat it with literary depth and narrative purpose. Focus on raw human emotions and uncensored storytelling." 
    : "TARGET AUDIENCE: General. Ensure the content remains strictly family-friendly, avoiding any explicit, graphic, or mature themes.";

  const systemInstruction = `You are an acclaimed, world-class Bengali novelist and storyteller. 
  Your writing quality should match that of legendary Bengali authors.
  Style: ${getStyleInstruction(settings.style)}
  Continuity: ${continuityInstruction}
  Maturity: ${matureInstruction}
  Language: Bengali (বাংলা).
  Task: Respond ONLY with the story text. No preamble, no postamble, no meta-talk.`;

  const context = existingContent ? getRelevantContext(existingContent) : "";
  
  const prompt = existingContent 
    ? `Title: "${settings.title || "গল্প"}"
       Context: This is a continuation of a ${settings.type}. 
       Instructions: Write the next part of the story. Do NOT start from the beginning. Start exactly where the previous text ended. 
       ${settings.plotHint ? `Next Plot Point: ${settings.plotHint}` : ''}
       
       --- START PREVIOUS PART ---
       ${context}
       --- END PREVIOUS PART ---
       
       CONTINUE STORY NOW:`
    : `Title: "${settings.title || "নতুন গল্প"}"
       Task: Write a new ${settings.type} in the ${settings.genre} genre. 
       ${settings.plotHint ? `Plot Details: ${settings.plotHint}` : ''}
       Desired Length: ${settings.length}. 
       
       START WRITING STORY NOW:`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: settings.continuityMode === 'strict' ? 0.7 : 0.9,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 4000 } // Allocate thinking budget for deep narrative planning
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
    const errStr = (error?.message || "").toLowerCase();
    
    if (errStr.includes("safety")) { 
      message = "নিরাপত্তা ফিল্টারের কারণে কন্টেন্ট জেনারেট করা সম্ভব হয়নি। অ্যাডাল্ট সেটিং অন থাকলেও কিছু অত্যন্ত সংবেদনশীল শব্দ এড়িয়ে চলার চেষ্টা করুন।"; 
      code = ERROR_CODES.SAFETY_BLOCKED; 
    } else if (errStr.includes("quota") || errStr.includes("429")) { 
      message = "সার্ভারের ওপর অনেক বেশি চাপ পড়ছে। অনুগ্রহ করে ১-২ মিনিট অপেক্ষা করে পুনরায় চেষ্টা করুন।"; 
      code = ERROR_CODES.QUOTA_EXCEEDED; 
    } else if (errStr.includes("network") || errStr.includes("fetch")) {
      message = "আপনার ইন্টারনেট সংযোগের সমস্যা দেখা দিচ্ছে। দয়া করে সংযোগটি পুনরায় চেক করুন।";
      code = ERROR_CODES.NETWORK_ISSUE;
    }
    
    throw new StoryGenerationError(message, code);
  }
};
