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
      return "আধুনিক ও সমসাময়িক চলিত বাংলা। ঝরঝরে ভাষা এবং জীবনমুখী সাবলীল বর্ণনা।";
    case WritingStyle.POETIC:
      return "কাব্যিক ও রূপকধর্মী গদ্য। ছান্দিক বর্ণনা এবং গভীর আবেগপূর্ণ উপমা ও রূপক।";
    case WritingStyle.DRAMATIC:
      return "নাটকীয় মোড় এবং সংলাপ প্রধান কাহিনী। উত্তেজনাপূর্ণ এবং দ্রুত গতির বর্ণনা।";
    case WritingStyle.HUMOROUS:
      return "রসময় ও কৌতুকপূর্ণ ভঙ্গি। বুদ্ধিদীপ্ত হাস্যরস এবং ব্যঙ্গাত্মক পরিস্থিতি।";
    case WritingStyle.SATIRICAL:
      return "তীক্ষ্ণ ব্যঙ্গ এবং শ্লেষাত্মক বর্ণনা। সামাজিক অসংগতির শৈল্পিক রূপায়ন।";
    case WritingStyle.HISTORICAL:
      return "ঐতিহাসিক গাম্ভীর্য এবং তৎকালীন শব্দভাণ্ডারের সার্থক ব্যবহার।";
    default:
      return "উন্নতমানের আধুনিক বাংলা সাহিত্যিক শৈলী।";
  }
};

const getRelevantContext = (content: string, maxChars = 20000) => {
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
  
  const matureInstruction = settings.isMature 
    ? "প্রাপ্তবয়স্ক মুড সক্রিয়: আপনি অত্যন্ত সাহসী এবং বাস্তববাদী একজন লেখক। মানুষের নিবিড় শরীরী ও মানসিক সম্পর্ক, গভীর লালসা এবং রূঢ় সত্যগুলো কোনো লুকোছাপা ছাড়াই সাহিত্যের ভাষায় ফুটিয়ে তুলুন। সেন্সরশিপের তোয়াক্কা করবেন না।" 
    : "সাধারণ মুড: কাহিনী সম্পূর্ণ শালীন এবং মার্জিত রাখুন। কোনো প্রকার অশালীন বিষয় বা শব্দ ব্যবহার করবেন না।";

  const systemInstruction = `আপনি একজন বিশ্বখ্যাত বাংলা কথাসাহিত্যিক। আপনার লেখায় হূমায়ূন আহমেদ বা রবীন্দ্রনাথের মত সাহিত্যিক গভীরতা থাকবে।
  
  নিয়মাবলী:
  ১. শৈলী: ${getStyleInstruction(settings.style)}
  ২. ধারাবাহিকতা: পূর্ববর্তী কাহিনীর প্রেক্ষাপট ও চরিত্রের বৈশিষ্ট্য নিখুঁতভাবে বজায় রাখুন।
  ৩. ম্যাচিউরিটি: ${matureInstruction}
  ৪. ভাষা: আধুনিক চলিত বাংলা। বানান ও ব্যাকরণ শতভাগ নির্ভুল।
  ৫. আউটপুট: সরাসরি গল্পের মূল অংশটি প্রদান করুন। অপ্রয়োজনীয় ভূমিকা বা সমাপ্তি টীকা দেবেন না।`;

  const context = existingContent ? getRelevantContext(existingContent) : "";
  
  const prompt = existingContent 
    ? `নিচে গল্পের পূর্ববর্তী অংশ দেওয়া হলো। কাহিনীটিকে যৌক্তিকভাবে আরও এগিয়ে নিয়ে যান:
       --- আগের অংশ শুরু ---
       ${context}
       --- আগের অংশ শেষ ---`
    : `শিরোনাম: "${settings.title || "নতুন গল্প"}"
       ধরন: ${settings.type}, জনরা: ${settings.genre}, বিষয়: ${settings.topic}
       দৈর্ঘ্য: ${settings.length}, প্লট: ${settings.plotHint || "একটি চমৎকার শুরু করুন।"}`;

  const safetySettings = settings.isMature ? [
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
  ] : [
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }
  ];

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9,
        topP: 1.0,
        thinkingConfig: { thinkingBudget: 32768 },
        safetySettings
      },
    });

    for await (const chunk of result) {
      if (signal?.aborted) break;
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    let message = "গল্প তৈরিতে সমস্যা হয়েছে।";
    let code = ERROR_CODES.UNKNOWN;
    const errStr = (error?.message || "").toLowerCase();
    
    if (errStr.includes("safety")) { 
      message = "নিরাপত্তা ফিল্টার কন্টেন্ট ব্লক করেছে। ১৮+ মুড অন থাকলে সাধারণত এটি হয় না। প্রেক্ষাপট বদলান।"; 
      code = ERROR_CODES.SAFETY_BLOCKED; 
    } else if (errStr.includes("quota") || errStr.includes("429")) { 
      message = "সার্ভারে চাপ বেশি। ১ মিনিট পর পুনরায় চেষ্টা করুন।"; 
      code = ERROR_CODES.QUOTA_EXCEEDED; 
    }
    throw new StoryGenerationError(message, code);
  }
};