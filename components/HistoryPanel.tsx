import React, { useState, useMemo } from 'react';
import { StoryHistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: StoryHistoryItem[];
  onLoad: (item: StoryHistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history.sort((a, b) => b.timestamp - a.timestamp);

    const term = searchTerm.toLowerCase().trim();
    return history
      .filter((item) => {
        const titleMatch = (item.settings.title || "").toLowerCase().includes(term);
        const genreMatch = item.settings.genre.toLowerCase().includes(term);
        const contentMatch = item.content.toLowerCase().includes(term);
        return titleMatch || genreMatch || contentMatch;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history, searchTerm]);

  if (!isOpen) return null;

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60) ;
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'এই মাত্র';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    if (days < 7) return `${days} দিন আগে`;
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">গল্পের মহাফেজখানা</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Your Story Archive</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-indigo-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bengali-font shadow-sm"
                placeholder="গল্পের নাম, জনরা বা কোনো বাক্য দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20">
                <div className="bg-slate-100 p-10 rounded-full">
                   <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="font-black text-xl bengali-font">এখনও কোনো গল্প শুরু করা হয়নি</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-black text-xl bengali-font">আপনার খোঁজা গল্পটি পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const words = item.content.trim().split(/\s+/).length;
                return (
                  <div 
                    key={item.id} 
                    className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-500 hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] transition-all relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1 pr-4">
                        <h3 className="font-black text-slate-900 text-lg bengali-font leading-snug group-hover:text-indigo-600 transition-colors">
                          {item.settings.title || "শিরোনামহীন গল্প"}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {getRelativeTime(item.timestamp)}
                        </p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-indigo-100/50">
                        {words} শব্দ
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/50 rounded-2xl p-4 mb-5 border border-slate-100/50">
                      <p className="text-sm text-slate-600 line-clamp-3 bengali-font leading-relaxed opacity-80">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {item.settings.type.split(' ')[0]}
                        </span>
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {item.settings.genre.split(' ')[0]}
                        </span>
                        {item.settings.isMature && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
                            18+
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="মুছে ফেলুন"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onLoad(item)}
                          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                          <span>পড়ুন</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-8 border-t border-slate-100 bg-white">
            <div className="flex items-center justify-center space-x-3 text-slate-400 mb-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Privacy Protected Storage</p>
            </div>
            <p className="text-[11px] text-slate-400 text-center font-bold bengali-font leading-relaxed">
              আপনার গল্পগুলি শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত থাকে। ক্যাশ বা ডাটা ক্লিয়ার করলে এগুলি হারিয়ে যেতে পারে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;