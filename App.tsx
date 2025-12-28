
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import HistoryPanel from './components/HistoryPanel';
import { StorySettings, StoryType, Genre, StoryState, WritingStyle, StoryHistoryItem } from './types';
import { generateStoryStream, StoryGenerationError, ERROR_CODES } from './services/gemini';

const STORAGE_KEY = 'golpakar_draft_v3';
const HISTORY_KEY = 'golpakar_history_v2';

const DEFAULT_SETTINGS: StorySettings = {
  title: '',
  type: StoryType.SHORT_STORY,
  genre: Genre.SOCIAL,
  style: WritingStyle.MODERN,
  isMature: false,
  length: 'medium',
  plotHint: '',
  continuityMode: 'strict',
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<StorySettings>(DEFAULT_SETTINGS);

  const [storyState, setStoryState] = useState<StoryState>({
    content: '',
    isGenerating: false,
    error: null,
  });

  const [history, setHistory] = useState<StoryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'idle'>('idle');

  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Load state on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.content) setStoryState(prev => ({ ...prev, content: parsed.content }));
      } catch (e) { console.error("Draft load failed", e); }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error("History load failed", e); }
    }
    initialLoadRef.current = true;
  }, []);

  // Auto-save debounced
  useEffect(() => {
    if (!initialLoadRef.current) return;
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, content: storyState.content }));
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus('saved');
      saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [settings, storyState.content]);

  // Sync History
  useEffect(() => {
    if (!initialLoadRef.current) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((content: string, storySettings: StorySettings) => {
    if (!content.trim()) return;
    const newItem: StoryHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: content.trim(),
      settings: { ...storySettings }
    };
    setHistory(prev => [newItem, ...prev.slice(0, 99)]);
  }, []);

  const updateLatestHistory = useCallback((content: string) => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      newHistory[0] = { ...newHistory[0], content: content.trim() };
      return newHistory;
    });
  }, []);

  const loadFromHistory = (item: StoryHistoryItem) => {
    setSettings(item.settings);
    setStoryState({ content: item.content, isGenerating: false, error: null });
    setIsHistoryOpen(false);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm("আপনি কি নিশ্চিত যে বর্তমান ড্রাফটটি মুছে ফেলতে চান? আপনার সেভ করা ইতিবৃত্ত অক্ষুণ্ণ থাকবে।")) {
      setSettings(DEFAULT_SETTINGS);
      setStoryState({ content: '', isGenerating: false, error: null });
    }
  }, []);

  const getErrorAdvice = (code?: string) => {
    switch (code) {
      case ERROR_CODES.SAFETY_BLOCKED:
        return "গোপনীয়তা বা নিরাপত্তা ফিল্টার আপনার অনুরোধটি গ্রহণ করতে পারছে না। কাহিনীর প্রেক্ষাপট বা সংলাপে থাকা সংবেদনশীল শব্দগুলো পরিবর্তন করে দেখুন। ১৮+ মুড অন থাকলে সাধারণত বাধা কম থাকে।";
      case ERROR_CODES.QUOTA_EXCEEDED:
        return "সার্ভারের ক্ষমতা অতিক্রম করেছে। অনুগ্রহ করে ১-২ মিনিট বিরতি দিয়ে পুনরায় চেষ্টা করুন।";
      case ERROR_CODES.NETWORK_ISSUE:
        return "ইন্টারনেট সংযোগ চেক করুন এবং পেজটি একবার রিফ্রেশ দিয়ে চেষ্টা করুন।";
      default:
        return "কিছুক্ষণ অপেক্ষা করে পুনরায় চেষ্টা করুন অথবা ব্রাউজারের ক্যাশ ক্লিয়ার করে দেখুন।";
    }
  };

  const handleGenerate = useCallback(async (isContinuation: boolean = false) => {
    if (storyState.isGenerating) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStoryState(prev => ({
      ...prev,
      content: isContinuation ? prev.content : '',
      isGenerating: true,
      error: null,
      errorCode: undefined
    }));

    try {
      let fullContentAccumulated = isContinuation ? storyState.content : '';
      
      await generateStoryStream(
        settings, 
        (chunk) => {
          fullContentAccumulated += chunk;
          setStoryState(prev => ({ ...prev, content: fullContentAccumulated }));
        },
        controller.signal,
        isContinuation ? storyState.content : undefined
      );
      
      setStoryState(prev => ({ ...prev, isGenerating: false }));
      
      if (!isContinuation) {
        addToHistory(fullContentAccumulated, settings);
      } else {
        updateLatestHistory(fullContentAccumulated);
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStoryState(prev => ({ ...prev, isGenerating: false }));
        return;
      }
      setStoryState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof StoryGenerationError ? err.message : "দুঃখিত, কোনো একটি ত্রুটি হয়েছে।",
        errorCode: err instanceof StoryGenerationError ? err.code : ERROR_CODES.UNKNOWN
      }));
    }
  }, [settings, storyState.isGenerating, storyState.content, addToHistory, updateLatestHistory]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-bengali">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} historyCount={history.length} saveStatus={saveStatus} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {storyState.error && (
          <div className="fixed bottom-24 lg:bottom-12 right-4 lg:right-12 z-[100] max-w-md w-[calc(100%-2rem)] bg-white border-l-8 border-red-500 p-8 rounded-r-3xl shadow-[0_40px_80px_rgba(0,0,0,0.35)] animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4 text-red-600">
                <div className="bg-red-50 p-2 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-black text-xl uppercase tracking-tight">সতর্কবার্তা</h3>
              </div>
              <button onClick={() => setStoryState(p => ({...p, error: null}))} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-base font-bold text-slate-900 leading-relaxed mb-6">{storyState.error}</p>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {getErrorAdvice(storyState.errorCode)}
              </p>
            </div>

            <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest">ID: {storyState.errorCode}</span>
               <button 
                 onClick={() => handleGenerate(storyState.content.length > 0)} 
                 className="text-sm font-black text-indigo-600 hover:text-white uppercase tracking-widest flex items-center space-x-3 bg-indigo-50 hover:bg-indigo-600 px-6 py-3 rounded-2xl active:scale-95 transition-all shadow-sm border border-indigo-100"
               >
                 <span>পুনরায় চেষ্টা</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>
            </div>
          </div>
        )}

        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          onGenerate={() => handleGenerate(false)}
          onStop={handleStop}
          onReset={handleReset}
          isGenerating={storyState.isGenerating}
        />

        <StoryDisplay 
          content={storyState.content} 
          isGenerating={storyState.isGenerating}
          settings={settings}
          onContinue={() => handleGenerate(true)}
        />
      </main>

      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onLoad={loadFromHistory} onDelete={deleteFromHistory} />
    </div>
  );
};

export default App;
