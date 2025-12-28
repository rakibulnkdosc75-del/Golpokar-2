
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import HistoryPanel from './components/HistoryPanel';
import { StorySettings, StoryType, Genre, StoryState, WritingStyle, StoryHistoryItem } from './types';
import { generateStoryStream, StoryGenerationError } from './services/gemini';

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
  });

  const [storyState, setStoryState] = useState<StoryState>({
    content: '',
    isGenerating: false,
    error: null,
  });

  const [history, setHistory] = useState<StoryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef(false);

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, content: storyState.content }));
  }, [settings, storyState.content]);

  // Save history whenever it changes
  useEffect(() => {
    if (!initialLoadRef.current) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (content: string, settings: StorySettings) => {
    if (!content.trim()) return;
    
    const newItem: StoryHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: content.trim(),
      settings: { ...settings }
    };
    
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // Keep last 50
  };

  const loadFromHistory = (item: StoryHistoryItem) => {
    setSettings(item.settings);
    setStoryState(prev => ({
      ...prev,
      content: item.content,
      error: null
    }));
    setIsHistoryOpen(false);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerate = useCallback(async (isContinuation: boolean = false) => {
    if (storyState.isGenerating) {
      abortControllerRef.current?.abort();
      setStoryState(prev => ({ ...prev, isGenerating: false }));
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
      
      // Auto-save to history after generation completes
      if (!isContinuation) {
        addToHistory(fullContent, settings);
      } else {
        // For continuation, we might want to update the history item or just leave it for user to save
        // For now, let's keep the simplicity of auto-saving on first full gen
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setStoryState(prev => ({
        ...prev,
        error: err instanceof StoryGenerationError ? err.message : "সমস্যা হয়েছে।",
        errorCode: err instanceof StoryGenerationError ? err.code : 'ERR_UNK_99'
      }));
    } finally {
      setStoryState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [settings, storyState]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} historyCount={history.length} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {storyState.error && (
          <div className="fixed bottom-24 lg:bottom-4 right-4 z-[100] max-w-sm bg-white border-l-4 border-red-600 p-4 rounded-r-xl shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-red-800">{storyState.error}</p>
              <button onClick={() => setStoryState(p => ({...p, error: null}))} className="text-slate-400">×</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Code: {storyState.errorCode}</p>
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
