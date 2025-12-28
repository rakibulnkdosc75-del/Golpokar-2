
import React from 'react';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  saveStatus: 'saving' | 'saved' | 'idle';
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory, historyCount, saveStatus }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">গল্পকার <span className="text-indigo-600">Golpakar</span></h1>
              <div className="flex items-center space-x-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Story Lab</p>
                {saveStatus !== 'idle' && (
                  <div className={`flex items-center space-x-1 animate-in fade-in duration-300`}>
                    <div className={`w-1 h-1 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${saveStatus === 'saving' ? 'text-amber-600' : 'text-green-600'}`}>
                      {saveStatus === 'saving' ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষিত'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenHistory}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-all active:scale-95 group relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline font-bold text-slate-700 text-sm">ইতিহাস</span>
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {historyCount}
                </span>
              )}
            </button>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              Live & Free
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
