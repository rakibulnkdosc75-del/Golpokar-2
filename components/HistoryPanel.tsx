
import React, { useState, useMemo } from 'react';
import { StoryHistoryItem, Theme } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: StoryHistoryItem[];
  onLoad: (item: StoryHistoryItem) => void;
  onDelete: (id: string) => void;
  theme: Theme;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return [...history].sort((a, b) => b.timestamp - a.timestamp);
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

  const bgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e8dfc5]' : 'bg-white border-slate-100';
  const textClass = theme === 'dark' ? 'text-slate-100' : theme === 'sepia' ? 'text-[#5b4636]' : 'text-slate-900';
  const cardBgClass = theme === 'dark' ? 'bg-slate-800 border-slate-700' : theme === 'sepia' ? 'bg-[#ebdcc0] border-[#d4c8af]' : 'bg-white border-slate-100 shadow-sm';

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'এই মাত্র';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className={`w-screen max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out transition-colors duration-500 ${bgClass}`}>
          <div className={`p-8 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h2 className={`text-3xl font-black tracking-tighter ${textClass}`}>গল্পের আর্কাইভ</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Literary Vault</p>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-8">
            <input
              type="text"
              placeholder="গল্পের নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none border focus:ring-4 focus:ring-indigo-500/10 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-8 space-y-6 scrollbar-hide">
            {filteredHistory.map((item) => (
              <div key={item.id} className={`group rounded-[2.5rem] p-7 transition-all relative border hover:border-indigo-500 ${cardBgClass}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className={`font-black text-xl bengali-font leading-tight group-hover:text-indigo-500 transition-colors ${textClass}`}>
                      {item.settings.title || "শিরোনামহীন"}
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getRelativeTime(item.timestamp)}</p>
                  </div>
                  <button onClick={() => onDelete(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                
                <p className="text-xs line-clamp-2 bengali-font opacity-60 mb-6 leading-relaxed">{item.content}</p>

                <div className="flex items-center justify-between">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase">{item.settings.genre.split(' ')[0]}</span>
                  <button onClick={() => onLoad(item)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Load</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`p-8 border-t text-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className="text-[9px] text-slate-400 font-bold bengali-font opacity-60">সব তথ্য আপনার ব্রাউজারেই সংরক্ষিত থাকে।</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
