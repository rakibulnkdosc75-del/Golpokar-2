
export enum StoryType {
  SHORT_STORY = 'ছোটগল্প (Short Story)',
  LONG_STORY = 'বড়গল্প (Boro Golpo)',
  NOVEL = 'উপন্যাস (Uponnash)',
  DRAMA = 'নাটক (Drama)',
  POETRY = 'কবিতা (Poetry/Lyrics)'
}

export enum Genre {
  ROMANCE = 'রোমান্টিক (Romance)',
  HORROR = 'ভৌতিক (Horror)',
  MYSTERY = 'রহস্য (Mystery)',
  THRILLER = 'থ্রিলার (Thriller)',
  SOCIAL = 'সামাজিক (Social)',
  FANTASY = 'কল্পকাহিনী (Fantasy)',
  COMEDY = 'হাস্যরসাত্মক (Comedy)'
}

export enum Topic {
  ADVENTURE = 'অভিযান (Adventure)',
  SCI_FI = 'কল্পবিজ্ঞান (Sci-Fi)',
  HISTORICAL = 'ঐতিহাসিক (Historical)',
  SOCIAL_ISSUES = 'সামাজিক সমস্যা (Social Issues)',
  DETECTIVE = 'গোয়েন্দা (Detective)',
  MYTHOLOGY = 'পৌরাণিক (Mythology)',
  SURVIVAL = 'অস্তিত্ব রক্ষা (Survival)',
  PHILOSOPHICAL = 'দার্শনিক (Philosophical)'
}

export enum WritingStyle {
  CLASSIC = 'ধ্রুপদী (Classic)',
  MODERN = 'আধুনিক (Modern)',
  POETIC = 'কাব্যাত্মক (Poetic)',
  DRAMATIC = 'নাটকীয় (Dramatic)',
  HUMOROUS = 'রসময় (Humorous)',
  SATIRICAL = 'ব্যঙ্গাত্মক (Satirical)',
  HISTORICAL = 'ঐতিহাসিক (Historical)'
}

export type Theme = 'light' | 'dark' | 'sepia';
export type ContinuityMode = 'strict' | 'flexible';

export interface StorySettings {
  title: string;
  type: StoryType;
  genre: Genre;
  topic: Topic;
  style: WritingStyle;
  isMature: boolean;
  length: 'very short' | 'short' | 'medium' | 'long' | 'very long';
  plotHint: string;
  continuityMode: ContinuityMode;
}

export interface StoryState {
  content: string;
  isGenerating: boolean;
  error: string | null;
  errorCode?: string;
}

export interface StoryHistoryItem {
  id: string;
  timestamp: number;
  content: string;
  settings: StorySettings;
}
