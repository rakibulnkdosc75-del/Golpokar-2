
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

export interface StorySettings {
  title: string;
  type: StoryType;
  genre: Genre;
  isMature: boolean;
  length: 'short' | 'medium' | 'long';
}

export interface StoryState {
  content: string;
  isGenerating: boolean;
  error: string | null;
}
