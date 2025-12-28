
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import { StorySettings, StoryType, Genre, StoryState } from './types';
import { generateStoryStream } from './services/gemini';

const App: React.FC = () => {
  const [settings, setSettings] = useState<StorySettings>({
    title: '',
    type: StoryType.SHORT_STORY,
    genre: Genre.SOCIAL,
    isMature: false,
    length: 'medium',
  });

  const [storyState, setStoryState] = useState<StoryState>({
    content: '',
    isGenerating: false,
    error: null,
  });

  const handleGenerate = useCallback(async () => {
    if (storyState.isGenerating) return;

    setStoryState({
      content: '',
      isGenerating: true,
      error: null,
    });

    try {
      await generateStoryStream(settings, (chunk) => {
        setStoryState(prev => ({
          ...prev,
          content: prev.content + chunk,
        }));
      });
    } catch (err: any) {
      setStoryState(prev => ({
        ...prev,
        error: err.message,
      }));
    } finally {
      setStoryState(prev => ({
        ...prev,
        isGenerating: false,
      }));
    }
  }, [settings, storyState.isGenerating]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Error Notification Overlay */}
        {storyState.error && (
          <div className="fixed bottom-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">{storyState.error}</span>
            <button onClick={() => setStoryState(p => ({...p, error: null}))} className="text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Configuration Sidebar */}
        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          onGenerate={handleGenerate}
          isGenerating={storyState.isGenerating}
        />

        {/* Story Display/Reader Area */}
        <StoryDisplay 
          content={storyState.content} 
          isGenerating={storyState.isGenerating}
          settings={settings}
        />
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-40">
        <button
          onClick={handleGenerate}
          disabled={storyState.isGenerating}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all ${
            storyState.isGenerating ? 'bg-indigo-400 text-white' : 'bg-indigo-600 text-white'
          }`}
        >
          {storyState.isGenerating ? 'লিখছে...' : 'নতুন গল্প শুরু করুন'}
        </button>
      </div>
    </div>
  );
};

export default App;
