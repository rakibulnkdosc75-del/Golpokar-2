
import React from 'react';
import { StorySettings, StoryType, Genre, Topic, WritingStyle } from '../types';

interface SidebarProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  onGenerate: () => void;
  onStop: () => void;
  onReset: () => void;
  isGenerating: boolean;
  isOnline: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onGenerate, onStop, onReset, isGenerating, isOnline }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleMature = () => {
    setSettings(prev => ({ ...prev, isMature: !prev.isMature }));
  };

  const handleToggleContinuity = () => {
    setSettings(prev => ({ ...prev, continuityMode: prev.continuityMode === 'strict' ? 'flexible' : 'strict' }));
  };

  const lengthOptions = [
    { id: 'very short', label: 'মাইক্রো' },
    { id: 'short', label: 'ক্ষুদ্র' },
    { id: 'medium', label: 'মাঝারি' },
    { id: 'long', label: 'দীর্ঘ' },
    { id: 'very long', label: 'বিশাল' },
  ];

  return (
    <div className="w-full lg:w-[360px] bg-slate-50/50 lg:bg-white border-r border-slate-200/60 p-6 overflow-y-auto space-y-8 h-full flex flex-col scrollbar-hide">
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center space-x-3 text-amber-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] font-black uppercase tracking-tight leading-tight">অফলাইন মোড: নতুন গল্প তৈরির জন্য ইন্টারনেট প্রয়োজন</p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-8">
        
        {/* Header Control */}
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Story Architect</h2>
          <button 
            onClick={onReset}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 group"
            title="নতুন খসড়া"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Essential Info Section */}
        <section className="space-y-5">
          <div className="group">
            <label htmlFor="title" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">গল্পের শিরোনাম (Title)</label>
            <div className="relative">
              <input
                id="title"
                type="text"
                name="title"
                value={settings.title}
                onChange={handleInputChange}
                placeholder="একটি চমৎকার নাম দিন..."
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plotHint" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">কাহিনীর সূত্র (Plot Base)</label>
            <textarea
              id="plotHint"
              name="plotHint"
              value={settings.plotHint}
              onChange={handleInputChange}
              placeholder="আপনার মাথায় কোনো দৃশ্য বা চরিত্র থাকলে তা লিখুন..."
              rows={4}
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none resize-none text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm leading-relaxed"
            />
          </div>
        </section>

        {/* Categorization Grid */}
        <section className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">সাহিত্যিক রূপ</label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  value={settings.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm"
                >
                  {Object.values(StoryType).map(type => (
                    <option key={type} value={type}>{type.split(' ')[0]}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="genre" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">জনরা</label>
              <div className="relative">
                <select
                  id="genre"
                  name="genre"
                  value={settings.genre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm"
                >
                  {Object.values(Genre).map(genre => (
                    <option key={genre} value={genre}>{genre.split(' ')[0]}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="topic" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">মূল থিম / বিষয়বস্তু</label>
            <div className="relative">
              <select
                id="topic"
                name="topic"
                value={settings.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm"
              >
                {Object.values(Topic).map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="style" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">লেখার ভঙ্গি (Style)</label>
            <div className="relative">
              <select
                id="style"
                name="style"
                value={settings.style}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm"
              >
                {Object.values(WritingStyle).map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Controls */}
        <section className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">বিস্তৃতি (Desired Output)</label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/40">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSettings(prev => ({ ...prev, length: opt.id as any }))}
                  className={`py-2 rounded-xl text-[9px] font-black transition-all ${
                    settings.length === opt.id 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">ধারাবাহিকতা মুড</span>
                <span className="text-[10px] text-slate-400 font-bold">{settings.continuityMode === 'strict' ? 'লজিক্যাল (Strict)' : 'ফ্রি-স্টাইল (Flexible)'}</span>
              </div>
              <button
                onClick={handleToggleContinuity}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all ring-offset-2 focus:ring-2 focus:ring-indigo-500 ${
                  settings.continuityMode === 'strict' ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settings.continuityMode === 'strict' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between px-1 group cursor-pointer" onClick={handleToggleMature}>
              <div className="flex flex-col">
                <span className="text-xs font-black text-rose-600 uppercase tracking-tighter">প্রাপ্তবয়স্ক মোড (Adult)</span>
                <span className="text-[10px] text-slate-400 font-bold">{settings.isMature ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
              </div>
              <button
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all ring-offset-2 focus:ring-2 focus:ring-rose-500 ${
                  settings.isMature ? 'bg-rose-500 shadow-md shadow-rose-100' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${settings.isMature ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {settings.isMature && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100/50 animate-in fade-in slide-in-from-top-2 duration-400">
                <div className="flex items-start space-x-3">
                  <div className="bg-rose-100 p-1 rounded-md mt-0.5">
                    <svg className="w-3.5 h-3.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-[10px] text-rose-700 font-bold leading-relaxed">
                    সতর্কবার্তা: প্রাপ্তবয়স্ক কন্টেন্ট সক্রিয়। সাহিত্যিক প্রয়োজনে সাহসী বিষয়বস্তু ব্যবহারের সময় শালীনতা বজায় রাখতে সাহায্য করবে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <button
          onClick={isGenerating ? onStop : onGenerate}
          disabled={!isOnline && !isGenerating}
          className={`w-full py-5 px-8 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 group overflow-hidden relative ${
            isGenerating 
            ? 'bg-rose-500 text-white shadow-rose-200' 
            : !isOnline
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white shadow-indigo-200 hover:shadow-indigo-300'
          }`}
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          {isGenerating ? (
            <>
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
              </div>
              <span className="relative z-10 bengali-font tracking-wide">থামুন</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="relative z-10 bengali-font tracking-wide">গল্প লিখুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
