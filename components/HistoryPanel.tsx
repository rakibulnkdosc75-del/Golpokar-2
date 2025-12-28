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
        const topicMatch = item.settings.topic.toLowerCase().includes(term);
        const contentMatch = item.content.toLowerCase().includes(term);
        return titleMatch || genreMatch || topicMatch || contentMatch;
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

  const cleanLabel = (val: string) => val.split(' (')[0];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-lg bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">গল্পের মহাফেজখানা</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Literary Archive</p>
            </div>
            <button 
              onClick={onClose}
              className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="px-8 py-6 bg-slate-50/50 sticky top-0 z-10 border-b border-slate-50">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                className="w-full pl-14 pr-14 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-slate-300"
                placeholder="নাম বা বিষয় দিয়ে গল্প খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-300 hover:text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center opacity-30">
                <div className="bg-slate-100 p-12 rounded-[3rem] mb-6">
                   <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="font-black text-xl bengali-font tracking-tight">এখনও কোনো গল্প শুরু করা হয়নি</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center opacity-30">
                <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-black text-xl bengali-font tracking-tight">আপনার খোঁজা গল্পটি পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const words = item.content.trim().split(/\s+/).length;
                return (
                  <div key={item.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-7 hover:border-indigo-200 hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.12)] transition-all relative active:scale-[0.98] cursor-default">
                    <div className="flex justify-between items-start mb-5">
                      <div className="space-y-2 pr-6">
                        <h3 className="font-black text-slate-900 text-xl bengali-font leading-tight group-hover:text-indigo-600 transition-colors">
                          {item.settings.title || "শিরোনামহীন গল্প"}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {getRelativeTime(item.timestamp)}
                        </p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black border border-indigo-100/50 shadow-sm">
                        {words} শব্দ
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/40 rounded-[1.8rem] p-5 mb-8 border border-slate-100/30">
                      <p className="text-sm text-slate-500 line-clamp-3 bengali-font leading-relaxed opacity-80">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2.5">
                        <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center shadow-sm">
                          {cleanLabel(item.settings.type)}
                        </span>
                        <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center shadow-sm">
                          {cleanLabel(item.settings.genre)}
                        </span>
                        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center shadow-sm">
                          {cleanLabel(item.settings.topic)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        <button onClick={() => onLoad(item)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Load</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-10 border-t border-slate-100 bg-white">
            <p className="text-[10px] text-slate-400 text-center font-bold bengali-font leading-relaxed opacity-60">
              আপনার সাহিত্যকর্মগুলো আপনার ব্রাউজারেই নিরাপদ। <br/>ক্যাশ ক্লিয়ার করলে তথ্য হারিয়ে যেতে পারে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;