
import { GoogleGenAI } from "@google/genai";
import { StorySettings, WritingStyle, StoryType } from "../types";

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
      return "বিশুদ্ধ ও ধ্রুপদী সাধু বা চলিত বাংলা। বঙ্কিমচন্দ্র, শরৎচন্দ্র বা রবীন্দ্রনাথের মত গাম্ভীর্যপূর্ণ এবং আলঙ্কারিক বর্ণনাভঙ্গি। শব্দচয়ন হবে গুরুগম্ভীর।";
    case WritingStyle.MODERN:
      return "আধুনিক ও সমসাময়িক ঝরঝরে চলিত বাংলা। হুমায়ূন আহমেদ বা সুনীল গঙ্গোপাধ্যায়ের মত সাবলীল এবং জীবনমুখী বর্ণনা। সংলাপ হবে জীবন্ত।";
    case WritingStyle.POETIC:
      return "অত্যন্ত কাব্যিক, গীতিময় এবং রূপকধর্মী গদ্য। ছান্দিক বর্ণনা এবং গভীর ভাবাবেগপূর্ণ উপমা ব্যবহার করুন।";
    case WritingStyle.DRAMATIC:
      return "তীব্র নাটকীয়তা, সংলাপের প্রাধান্য এবং দ্রুত গতির কাহিনী। প্রতিটি পরতে থাকবে উত্তেজনা ও রহস্য।";
    case WritingStyle.HUMOROUS:
      return "বুদ্ধিদীপ্ত হাস্যরস এবং কৌতুকপূর্ণ ভঙ্গি। পরশুরাম বা শিবরাম চক্রবর্তীর মত ব্যঙ্গাত্মক পরিস্থিতি তৈরি করুন।";
    case WritingStyle.SATIRICAL:
      return "তীক্ষ্ণ ব্যঙ্গ এবং বিদ্রূপাত্মক বর্ণনা। সমাজের অসঙ্গতিগুলো অত্যন্ত সাহসের সাথে সাহিত্যে ফুটিয়ে তুলুন।";
    default:
      return "উন্নতমানের বাংলা সাহিত্যিক শৈলী।";
  }
};

const getTypeInstruction = (type: StoryType) => {
  switch (type) {
    case StoryType.LONG_STORY:
      return "এটি একটি 'বড়গল্প' (Boro Golpo)। কাহিনীর বিস্তার হবে বিস্তৃত, চরিত্রের গভীরতা থাকবে এবং বর্ণনায় থাকবে পরিপক্কতা। অন্তত ৫-৬টি গুরুত্বপূর্ণ দৃশ্যপট তৈরি করুন।";
    case StoryType.NOVEL:
      return "এটি একটি 'উপন্যাস' (Uponnash)। এটি একটি দীর্ঘ মহাকাব্যিক যাত্রা। কাহিনীর গঠন হবে জটিল, বহু চরিত্রের আনাগোনা থাকবে এবং সামাজিক বা মনস্তাত্ত্বিক প্রেক্ষাপট হবে বিশাল। কাহিনীর অন্তত প্রথম ৩টি বড় অধ্যায় বা পার্ট তৈরি করার চেষ্টা করুন এবং প্লটটি ভবিষ্যতে আরও বড় করার সুযোগ রাখুন।";
    default:
      return "এটি একটি আকর্ষণীয় ছোটগল্প। একটি নির্দিষ্ট মোড় বা চমক দিয়ে কাহিনী শেষ করুন।";
  }
};

export const generateStoryStream = async (
  settings: StorySettings,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  existingContent?: string
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new StoryGenerationError("এপিআই কী (API Key) পাওয়া যায়নি। সিস্টেম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।", ERROR_CODES.MISSING_API_KEY);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const matureInstruction = settings.isMature 
    ? "প্রাপ্তবয়স্ক (Adult/18+) মুড সক্রিয়: আপনি একজন সাহসী সাহিত্যিক। প্রাপ্তবয়স্কদের জন্য কাহিনীর গভীর শরীরী বর্ণনা, তীব্র লালসা, অন্ধকার সত্য এবং রূঢ় বাস্তবতা কোনো দ্বিধা ছাড়াই সাহিত্যের ভাষায় ফুটিয়ে তুলুন। কোনো প্রকার সেন্সরশিপ ছাড়াই মানুষের আদিম প্রবৃত্তিগুলো নিখুঁতভাবে বর্ণনা করুন। এটি শুধুমাত্র প্রাপ্তবয়স্ক পাঠকদের জন্য।" 
    : "পরিবার-বান্ধব মুড: কাহিনী সম্পূর্ণ মার্জিত ও শালীন রাখুন। শিশুদের পড়ার উপযোগী শব্দ ও বিষয় ব্যবহার করুন। কোনো প্রকার কুরুচিপূর্ণ ইঙ্গিত দেবেন না।";

  const systemInstruction = `আপনি একজন বিশ্বমানের বাংলা কথাসাহিত্যিক এবং ঔপন্যাসিক। আপনার লক্ষ্য হলো পাঠকের মনে গভীর দাগ কেটে যাওয়া এক অসাধারণ কাহিনী তৈরি করা।

শৈলী ও কাঠামোগত নির্দেশাবলী:
১. ধরন ও গঠন: ${getTypeInstruction(settings.type)}
২. ভাষা শৈলী: ${getStyleInstruction(settings.style)}
৩. বিষয়বস্তু: ${settings.topic} এর উপর ভিত্তি করে মৌলিক ও রোমাঞ্চকর কাহিনী।
৪. প্রাপ্তবয়স্ক মুড: ${matureInstruction}
৫. ধারাবাহিকতা: যদি কাহিনীর আগের অংশ দেওয়া থাকে, তবে চরিত্রের স্বভাব ও গল্পের মোড় বজায় রেখে যৌক্তিকভাবে কাহিনী এগিয়ে নিন।
৬. শুদ্ধতা: বাংলা বানানে কোনো ভুল করা চলবে না। বর্ণনায় গতিশীলতা বজায় রাখুন।
৭. আউটপুট: সরাসরি গল্পের টেক্সট দিন। কোনো অতিরিক্ত নোট বা ভূমিকা দেবেন না।`;

  const prompt = existingContent 
    ? `গল্পের পরবর্তী অংশ এখান থেকে শুরু করুন (আগের অংশের রেশ ধরে):\n\n--- আগের অংশ ---\n${existingContent.slice(-6000)}\n--- শেষ ---`
    : `গল্পের শিরোনাম: "${settings.title || "নামহীন গল্প"}"\nপ্লট আইডিয়া: ${settings.plotHint || "একটি রহস্যময় ও সুন্দর শুরু করুন।"}\nগল্পের দৈর্ঘ্য লক্ষ্যমাত্রা: ${settings.length}`;

  // Maximum permission for 18+ mode to avoid safety triggering
  const safetySettings = settings.isMature ? [
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
  ] : [
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }
  ];

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 32768 },
        safetySettings
      },
    });

    for await (const chunk of response) {
      if (signal?.aborted) break;
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    const errStr = (error?.message || "").toLowerCase();
    
    if (errStr.includes("safety")) { 
      throw new StoryGenerationError("নিরাপত্তা ফিল্টার দ্বারা বাধাগ্রস্ত। প্লটের মোড় কিছুটা পরিবর্তন করে পুনরায় চেষ্টা করুন বা প্রাপ্তবয়স্ক মোড চেক করুন।", ERROR_CODES.SAFETY_BLOCKED); 
    } else if (errStr.includes("quota") || errStr.includes("429")) {
      throw new StoryGenerationError("সার্ভার বর্তমানে অত্যন্ত ব্যস্ত। দয়া করে ১-২ মিনিট পর চেষ্টা করুন।", ERROR_CODES.QUOTA_EXCEEDED);
    } else if (!navigator.onLine) {
      throw new StoryGenerationError("ইন্টারনেট সংযোগ নেই। আপনার ড্রাফটটি সেভ করা হয়েছে।", ERROR_CODES.NETWORK_ISSUE);
    }
    throw new StoryGenerationError(error.message || "গল্প তৈরিতে একটি অজানা ত্রুটি হয়েছে।", ERROR_CODES.UNKNOWN);
  }
};
