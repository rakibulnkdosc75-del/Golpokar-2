import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import HistoryPanel from './components/HistoryPanel';
import { StorySettings, StoryType, Genre, Topic, StoryState, WritingStyle, StoryHistoryItem, Theme } from './types';
import { generateStoryStream, StoryGenerationError, ERROR_CODES } from './services/gemini';

const STORAGE_KEY = 'golpakar_draft_v6_offline';
const HISTORY_KEY = 'golpakar_history_v5_offline';
const THEME_KEY = 'golpakar_theme_v2';

const DEFAULT_SETTINGS: StorySettings = {
  title: '',
  type: StoryType.SHORT_STORY,
  genre: Genre.SOCIAL,
  topic: Topic.SOCIAL_ISSUES,
  style: WritingStyle.MODERN,
  isMature: false,
  length: 'medium',
  plotHint: '',
  continuityMode: 'strict',
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<StorySettings>(DEFAULT_SETTINGS);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'light');

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

  // Monitor Network Status with high fidelity
  useEffect(() => {
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (!online) {
        setStoryState(prev => ({ 
          ...prev, 
          error: "ইন্টারনেট সংযোগ বিচ্ছিন্ন। আপনি অফলাইনেও লিখতে পারবেন, যা স্বয়ংক্রিয়ভাবে সেভ হবে।", 
          errorCode: ERROR_CODES.NETWORK_ISSUE 
        }));
      } else {
        setStoryState(prev => ({ ...prev, error: null }));
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Theme Persistence
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.className = theme === 'dark' ? 'dark-mode' : theme === 'sepia' ? 'sepia-mode' : '';
  }, [theme]);

  // Load persistence on Mount
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
    
    // Register Service Worker for true offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(reg => console.log('Offline engine registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
    }
  }, []);

  // Robust Auto-Save (Essential for offline reliability)
  useEffect(() => {
    if (!initialLoadRef.current) return;
    
    setSaveStatus('saving');
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, content: storyState.content }));
        setSaveStatus('saved');
        saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error("Local storage sync failed", e);
        setSaveStatus('idle');
      }
    }, 1000);

    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [settings, storyState.content]);

  // Sync History to Disk
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

  const handleManualEdit = (newContent: string) => {
    setStoryState(prev => ({ ...prev, content: newContent }));
  };

  const loadFromHistory = (item: StoryHistoryItem) => {
    setSettings(item.settings);
    setStoryState({ content: item.content, isGenerating: false, error: null });
    setIsHistoryOpen(false);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm("বর্তমান গল্পটি কি পুরোপুরি মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) {
      setSettings(DEFAULT_SETTINGS);
      setStoryState({ content: '', isGenerating: false, error: null });
    }
  }, []);

  const handleGenerate = useCallback(async (isContinuation: boolean = false) => {
    if (storyState.isGenerating) return;
    
    if (!isOnline) {
      setStoryState(prev => ({ 
        ...prev, 
        error: "আপনি অফলাইনে আছেন। নতুন গল্প তৈরির জন্য ইন্টারনেট সংযোগ প্রয়োজন। তবে আপনি নিজেই লেখা চালিয়ে যেতে পারেন।", 
        errorCode: ERROR_CODES.NETWORK_ISSUE 
      }));
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStoryState(prev => ({
      ...prev,
      content: isContinuation ? prev.content : '',
      isGenerating: true,
      error: null
    }));

    try {
      let fullContent = isContinuation ? storyState.content : '';
      await generateStoryStream(
        settings, 
        (chunk) => {
          fullContent += chunk;
          setStoryState(prev => ({ ...prev, content: fullContent }));
        },
        controller.signal,
        isContinuation ? storyState.content : undefined
      );
      setStoryState(prev => ({ ...prev, isGenerating: false }));
      if (!isContinuation) addToHistory(fullContent, settings);
      else updateLatestHistory(fullContent);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setStoryState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || "গল্প তৈরিতে ত্রুটি হয়েছে।",
        errorCode: err.code || ERROR_CODES.UNKNOWN
      }));
    }
  }, [settings, storyState.isGenerating, storyState.content, addToHistory, updateLatestHistory, isOnline]);

  const containerThemeClass = theme === 'dark' ? 'bg-slate-950 text-slate-200' : theme === 'sepia' ? 'bg-[#fdf9f0] text-[#5b4636]' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-bengali transition-colors duration-500 ${containerThemeClass}`}>
      <Header 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        historyCount={history.length} 
        saveStatus={saveStatus} 
        isOnline={isOnline} 
        theme={theme}
      />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          onGenerate={() => handleGenerate(false)} 
          onStop={handleStop} 
          onReset={handleReset} 
          isGenerating={storyState.isGenerating} 
          isOnline={isOnline} 
          theme={theme}
        />
        
        <StoryDisplay 
          content={storyState.content} 
          isGenerating={storyState.isGenerating} 
          settings={settings} 
          onContinue={() => handleGenerate(true)} 
          isOnline={isOnline}
          onContentChange={handleManualEdit}
          theme={theme}
          onThemeChange={setTheme}
        />

        {storyState.error && (
          <div className={`fixed bottom-24 right-4 z-[100] max-w-sm p-6 rounded-2xl shadow-2xl border-l-4 border-rose-500 animate-in slide-in-from-right-full duration-500 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-rose-500 uppercase text-[10px] tracking-widest">বিজ্ঞপ্তি</h3>
              <button onClick={() => setStoryState(p => ({...p, error: null}))} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="text-sm font-bold leading-relaxed">{storyState.error}</p>
            {isOnline && storyState.errorCode !== ERROR_CODES.NETWORK_ISSUE && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => handleGenerate(storyState.content.length > 0)} className="text-[10px] font-black uppercase text-indigo-500 hover:underline tracking-widest">আবার চেষ্টা করুন</button>
              </div>
            )}
          </div>
        )}
      </main>

      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onLoad={loadFromHistory} 
        onDelete={deleteFromHistory} 
        theme={theme}
      />
    </div>
  );
};

export default App;