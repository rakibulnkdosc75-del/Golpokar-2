
import React from 'react';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  saveStatus: 'saving' | 'saved' | 'idle';
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory, historyCount, saveStatus, isOnline }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-[60] h-20 flex items-center shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 w-full flex justify-between items-center">
        <div className="flex items-center space-x-5 group cursor-default">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-2.5 rounded-2xl shadow-xl shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              গল্পকার <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Golpakar</span>
            </h1>
            <div className="flex items-center space-x-3 mt-1.5 h-4">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Next-Gen Bengali AI Writer</p>
              
              <div className="w-[1px] h-3 bg-slate-200 mx-1" />
              
              <div className="relative flex items-center h-full">
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Syncing Draft</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-300">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/80">Cloud Saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <button 
            onClick={onOpenHistory}
            className="flex items-center space-x-3 bg-slate-50 hover:bg-white hover:shadow-md hover:shadow-slate-200 border border-slate-200/60 px-5 py-2.5 rounded-2xl transition-all active:scale-95 group relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline font-black text-slate-600 text-[11px] uppercase tracking-widest group-hover:text-slate-900 transition-colors">Archive</span>
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-in zoom-in duration-500">
                {historyCount}
              </span>
            )}
          </button>
          
          <div className="hidden lg:flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100/50">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Professional Tier
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
