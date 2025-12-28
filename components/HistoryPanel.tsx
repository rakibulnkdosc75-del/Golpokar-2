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

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
            <div>
              <h2 className="text-xl font-bold text-slate-900">গল্পের ইতিহাস (History)</h2>
              <p className="text-xs text-slate-500 font-medium">আপনার সংরক্ষিত সকল গল্প এখানে পাবেন</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bengali-font"
                placeholder="গল্পের নাম, জনরা বা কী-ওয়ার্ড দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">এখনও কোনো গল্প সেভ করা হয়নি</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">"{searchTerm}" এর সাথে মিল রয়েছে এমন কিছু পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1 flex-1 pr-2">
                      {item.settings.title || "নামহীন গল্প"}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(item.timestamp).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 bengali-font leading-relaxed italic">
                    {item.content.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex space-x-2 text-slate-500 font-bold uppercase tracking-tighter">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{item.settings.type.split(' ')[0]}</span>
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[9px]">{item.settings.genre.split(' ')[0]}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ডিলিট করুন"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onLoad(item)}
                        className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <span>দেখুন</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
              গল্পগুলি আপনার ব্রাউজারে সংরক্ষিত থাকে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;