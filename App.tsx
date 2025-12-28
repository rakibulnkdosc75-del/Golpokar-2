import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import HistoryPanel from './components/HistoryPanel';
import { StorySettings, StoryType, Genre, StoryState, WritingStyle, StoryHistoryItem } from './types';
import { generateStoryStream, StoryGenerationError, ERROR_CODES } from './services/gemini';

const STORAGE_KEY = 'golpakar_draft_v2';
const HISTORY_KEY = 'golpakar_history_v1';

const App: React.FC = () => {
  const [settings, setSettings] = useState<StorySettings>({
    title: '',
    type: StoryType.SHORT_STORY,
    genre: Genre.SOCIAL,
    style: WritingStyle.MODERN,
    isMature: false,
    length: 'medium',
    plotHint: '',
    continuityMode: 'strict',
  });

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

  // Load saved draft and history on mount
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

  // Save draft whenever settings or content change
  useEffect(() => {
    if (!initialLoadRef.current) return;
    
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, content: storyState.content }));
    
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus('saved');
      saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [settings, storyState.content]);

  // Save history whenever it changes
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
    
    setHistory(prev => [newItem, ...prev.slice(0, 49)]);
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
    setStoryState({
      content: item.content,
      isGenerating: false,
      error: null
    });
    setIsHistoryOpen(false);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getErrorAdvice = (code?: string) => {
    switch (code) {
      case ERROR_CODES.SAFETY_BLOCKED:
        return "পরামর্শ: গল্পের প্রেক্ষাপট (Plot Hint) কিছুটা পরিবর্তন করে সাধারণ শব্দ ব্যবহার করুন। অথবা ১৮+ সেটিংটি অন/অফ করে ট্রাই করুন।";
      case ERROR_CODES.QUOTA_EXCEEDED:
        return "পরামর্শ: আপনি অনেক বেশি রিকোয়েস্ট পাঠিয়েছেন। দয়া করে এক মিনিট অপেক্ষা করে পুনরায় চেষ্টা করুন।";
      case ERROR_CODES.MISSING_API_KEY:
        return "পরামর্শ: সার্ভার কনফিগারেশনে সমস্যা। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
      case ERROR_CODES.NETWORK_ISSUE:
        return "পরামর্শ: আপনার ইন্টারনেট সংযোগ চেক করুন এবং পেজটি রিফ্রেশ দিন।";
      default:
        return "পরামর্শ: আবার চেষ্টা করুন অথবা কিছু টেক্সট পরিবর্তন করে দেখুন।";
    }
  };

  const handleGenerate = useCallback(async (isContinuation: boolean = false) => {
    if (storyState.isGenerating) {
      abortControllerRef.current?.abort();
      return;
    }

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
          setStoryState(prev => ({ ...prev, content: prev.content + chunk }));
        },
        controller.signal,
        isContinuation ? storyState.content : undefined
      );
      
      // Generation finished successfully
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
        error: err instanceof StoryGenerationError ? err.message : "দুঃখিত, কোনো একটি সমস্যা হয়েছে।",
        errorCode: err instanceof StoryGenerationError ? err.code : ERROR_CODES.UNKNOWN
      }));
    }
  }, [settings, storyState.isGenerating, storyState.content, addToHistory, updateLatestHistory]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} historyCount={history.length} saveStatus={saveStatus} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {storyState.error && (
          <div className="fixed bottom-24 lg:bottom-10 right-10 z-[100] max-w-sm w-full bg-white border-l-4 border-red-500 p-6 rounded-r-3xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="font-black text-base uppercase tracking-tight">সতর্কবার্তা</h3>
              </div>
              <button 
                onClick={() => setStoryState(p => ({...p, error: null}))} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-sm font-bold text-slate-900 leading-relaxed mb-4">
              {storyState.error}
            </p>
            
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
              <p className="text-xs text-red-700 font-bold leading-normal">
                {getErrorAdvice(storyState.errorCode)}
              </p>
            </div>

            <div className="flex justify-between items-center">
               <p className="text-[10px] text-slate-400 font-mono font-bold">ERR_ID: {storyState.errorCode}</p>
               <button 
                onClick={() => handleGenerate(storyState.content.length > 0)}
                className="text-[12px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-lg"
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
          isGenerating={storyState.isGenerating}
        />

        <StoryDisplay 
          content={storyState.content} 
          isGenerating={storyState.isGenerating}
          settings={settings}
          onContinue={() => handleGenerate(true)}
        />
      </main>

      <HistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={loadFromHistory}
        onDelete={deleteFromHistory}
      />
    </div>
  );
};

export default App;