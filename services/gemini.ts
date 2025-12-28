
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
      return "বিশুদ্ধ ও ধ্রুপদী বাংলা সাহিত্যিক শৈলী। বঙ্কিমচন্দ্র বা শরৎচন্দ্রীয় গাম্ভীর্যপূর্ণ বর্ণনাভঙ্গি।";
    case WritingStyle.MODERN:
      return "আধুনিক ও সমসাময়িক চলিত বাংলা। ঝরঝরে ভাষা এবং জীবনমুখী বর্ণনা।";
    case WritingStyle.POETIC:
      return "কাব্যিক ও রূপকধর্মী গদ্য। ছান্দিক বর্ণনা এবং গভীর আবেগপূর্ণ শব্দচয়ন।";
    case WritingStyle.DRAMATIC:
      return "নাটকীয় মোড় এবং সংলাপ প্রধান কাহিনী। উত্তেজনাপূর্ণ এবং দ্রুত গতির বর্ণনা।";
    case WritingStyle.HUMOROUS:
      return "রসময় ও কৌতুকপূর্ণ ভঙ্গি। বুদ্ধিদীপ্ত হাস্যরস এবং ব্যঙ্গাত্মক পরিস্থিতি।";
    case WritingStyle.SATIRICAL:
      return "তীক্ষ্ণ ব্যঙ্গ এবং শ্লেষাত্মক বর্ণনা। সামাজিক অসংগতির শৈল্পিক রূপায়ন।";
    case WritingStyle.HISTORICAL:
      return "ঐতিহাসিক গাম্ভীর্য এবং তৎকালীন ভাষাভঙ্গি। ঐতিহাসিক শব্দভাণ্ডারের সার্থক ব্যবহার।";
    default:
      return "উন্নতমানের আধুনিক বাংলা সাহিত্যিক শৈলী।";
  }
};

const getRelevantContext = (content: string, maxChars = 12000) => {
  if (content.length <= maxChars) return content;
  return "[...গল্পের আগের অংশ...] " + content.slice(-maxChars);
};

export const generateStoryStream = async (
  settings: StorySettings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  existingContent?: string
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new StoryGenerationError("সিস্টেম ত্রুটি: এপিআই কী পাওয়া যায়নি।", ERROR_CODES.MISSING_API_KEY);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const continuityInstruction = settings.continuityMode === 'strict' 
    ? "পূর্ববর্তী কাহিনীর ধারা, চরিত্রের নাম এবং প্রেক্ষাপট নিখুঁতভাবে বজায় রাখুন। কোনো অসংগতি বা যুক্তিহীনতা যেন না থাকে।"
    : "কাহিনীতে নতুন চমক আনুন। প্রয়োজনে মূল প্রেক্ষাপট থেকে কিছুটা সরে গিয়ে নতুন মোড় সৃষ্টি করুন।";

  const matureInstruction = settings.isMature 
    ? "টার্গেট অডিয়েন্স: ১৮+ (প্রাপ্তবয়স্ক)। আপনি একজন আধুনিক ও সাহসী লেখক হিসেবে মানুষের নিবিড় সম্পর্ক, মনস্তাত্ত্বিক জটিলতা, রূঢ় বাস্তবতা এবং প্রাপ্তবয়স্কদের উপযোগী বিষয়গুলো শৈল্পিকভাবে ফুটিয়ে তুলুন। সেন্সরশিপের ভয় না রেখে গভীর আবেগ ও শরীরী আবেদনের চিত্রায়ন করুন।" 
    : "টার্গেট অডিয়েন্স: সাধারণ। কাহিনী সম্পূর্ণ শালীন এবং পরিবারবান্ধব রাখুন। কোনো প্রাপ্তবয়স্ক বা অশালীন বিষয় সম্পূর্ণ বর্জন করুন।";

  const systemInstruction = `আপনি একজন শ্রেষ্ঠ বাংলা কথাসাহিত্যিক এবং আধুনিক গল্পকার। 
  আপনার লেখনীতে শিল্পের ছোঁয়া এবং ভাষাগত মাধুর্য থাকতে হবে।
  শৈলী: ${getStyleInstruction(settings.style)}
  ধারাবাহিকতা: ${continuityInstruction}
  ম্যাচিউরিটি: ${matureInstruction}
  ভাষা: মানসম্মত বাংলা (Cholitobhasha)।
  কাজ: শুধুমাত্র গল্পের মূল অংশটি প্রদান করুন। কোনো ভূমিকা বা বাড়তি কথা বলবেন না।`;

  const context = existingContent ? getRelevantContext(existingContent) : "";
  
  const prompt = existingContent 
    ? `শিরোনাম: "${settings.title || "গল্প"}"
       কাজ: নিচের পূর্ববর্তী অংশের পর থেকে কাহিনীটি সাবলীলভাবে এগিয়ে নিয়ে যান। পুনরাবৃত্তি করবেন না।
       
       --- আগের অংশ শুরু ---
       ${context}
       --- আগের অংশ শেষ ---
       
       পরবর্তী অংশ এখান থেকে শুরু করুন:`
    : `শিরোনাম: "${settings.title || "নতুন গল্প"}"
       ধরন: ${settings.type}
       জনরা: ${settings.genre}
       দৈর্ঘ্য: ${settings.length}
       প্রেক্ষাপট: ${settings.plotHint || "একটি চমৎকার গল্পের অবতারণা করুন।"}
       
       গল্পের সূচনা এখান থেকে:`

  // Config with relaxed safety for mature mode
  const safetySettings = settings.isMature ? [
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
  ] : undefined;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: settings.continuityMode === 'strict' ? 0.7 : 0.9,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 12000 },
        safetySettings
      },
    });

    for await (const chunk of result) {
      if (signal?.aborted) break;
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    
    let message = "দুঃখিত, গল্প তৈরিতে সমস্যা হয়েছে।";
    let code = ERROR_CODES.UNKNOWN;
    const errStr = (error?.message || "").toLowerCase();
    
    if (errStr.includes("safety")) { 
      message = "নিরাপত্তা ফিল্টারের কারণে কন্টেন্ট ব্লক করা হয়েছে। দয়া করে প্রেক্ষাপট কিছুটা পরিবর্তন করুন।"; 
      code = ERROR_CODES.SAFETY_BLOCKED; 
    } else if (errStr.includes("quota") || errStr.includes("429")) { 
      message = "সার্ভারে অত্যধিক ট্রাফিক। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।"; 
      code = ERROR_CODES.QUOTA_EXCEEDED; 
    }
    
    throw new StoryGenerationError(message, code);
  }
};
