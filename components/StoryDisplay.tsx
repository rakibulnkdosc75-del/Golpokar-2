
import React from 'react';
import { StorySettings } from '../types';

interface StoryDisplayProps {
  content: string;
  isGenerating: boolean;
  settings: StorySettings;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ content, isGenerating, settings }) => {
  const isPlaceholder = !content && !isGenerating;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 min-h-full">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl min-h-[80vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Story Header Decor */}
        <div className="h-2 bg-indigo-600 w-full"></div>
        
        <div className="p-8 md:p-12 flex-1">
          {isPlaceholder ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
              <div className="p-4 bg-indigo-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">আপনার নতুন গল্প শুরু করুন</h2>
                <p className="text-slate-500 max-w-sm">বামে সেটিং থেকে শিরোনাম এবং জনরা সিলেক্ট করে 'তৈরি করুন' বাটনে ক্লিক করুন।</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="border-b border-slate-100 pb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                  {settings.title || "গল্পের শিরোনাম"}
                </h1>
                <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {settings.type}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l1.481 22.338a1 1 0 01-1.99.132l-1.481-22.338a1 1 0 011.093-1.082zM17.657 5.741a1 1 0 01.022 1.412l-14 14a1 1 0 01-1.414-1.414l14-14a1 1 0 011.392-.022z" clipRule="evenodd" />
                    </svg>
                    {settings.genre}
                  </span>
                </div>
              </div>

              <div className="story-content text-slate-800 text-lg md:text-xl leading-[1.8] whitespace-pre-wrap bengali-font select-text">
                {content}
                {isGenerating && (
                  <span className="inline-block w-2 h-6 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
                )}
              </div>
            </div>
          )}
        </div>

        {content && !isGenerating && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center space-x-4">
             <button 
              onClick={() => {
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${settings.title || 'story'}.txt`;
                a.click();
              }}
              className="flex items-center space-x-2 text-indigo-600 font-bold hover:text-indigo-700 text-sm py-2 px-4 rounded-lg bg-white border border-indigo-100 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>ডাউনলোড করুন</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(content);
                alert('গল্পটি কপি করা হয়েছে!');
              }}
              className="flex items-center space-x-2 text-slate-600 font-bold hover:text-slate-800 text-sm py-2 px-4 rounded-lg bg-white border border-slate-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>কপি করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
