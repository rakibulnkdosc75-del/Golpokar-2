
import React from 'react';
import { StorySettings, StoryType, Genre, Topic, WritingStyle, Theme } from '../types';

interface SidebarProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  onGenerate: () => void;
  onStop: () => void;
  onReset: () => void;
  isGenerating: boolean;
  isOnline: boolean;
  theme: Theme;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onGenerate, onStop, onReset, isGenerating, isOnline, theme }) => {
  const bgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e8dfc5]' : 'bg-white border-slate-200';
  const labelClass = theme === 'dark' ? 'text-slate-400' : theme === 'sepia' ? 'text-[#8c7462]' : 'text-slate-500';
  const inputBgClass = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : theme === 'sepia' ? 'bg-[#ebdcc0] border-[#d4c8af] text-[#5b4636]' : 'bg-slate-50 border-slate-100 text-slate-800';

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

  return (
    <div className={`w-full lg:w-[380px] border-r p-6 overflow-y-auto space-y-8 h-full flex flex-col scrollbar-hide z-50 transition-colors duration-500 ${bgClass}`}>
      
      {!isOnline && (
        <div className={`border rounded-2xl p-4 animate-pulse ${theme === 'dark' ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-tight ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>অফলাইন মোড সক্রিয়</p>
              <p className={`text-[10px] font-bold mt-1 ${theme === 'dark' ? 'text-amber-500/80' : 'text-amber-600'}`}>নতুন গল্প তৈরি বন্ধ। ড্রাফট লিখতে ও সেভ করতে পারবেন।</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-8">
        <div className={`flex items-center justify-between pb-2 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Story Architect</h2>
          <button 
            onClick={onReset}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-red-500 transition-all disabled:opacity-30 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <section className="space-y-6">
          <div className="group">
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${labelClass}`}>শিরোনাম (Title)</label>
            <input
              type="text"
              name="title"
              value={settings.title}
              onChange={handleInputChange}
              placeholder="গল্পের নাম..."
              className={`w-full px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold ${inputBgClass}`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${labelClass}`}>প্লট বা সারসংক্ষেপ (Plot)</label>
            <textarea
              name="plotHint"
              value={settings.plotHint}
              onChange={handleInputChange}
              placeholder="গল্পের একটি প্রাথমিক ধারণা দিন..."
              rows={4}
              className={`w-full px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none text-sm font-bold leading-relaxed ${inputBgClass}`}
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${labelClass}`}>সাহিত্যিক রূপ</label>
            <select name="type" value={settings.type} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl text-[11px] font-black focus:border-indigo-500 outline-none ${inputBgClass}`}>
              {Object.values(StoryType).map(type => <option key={type} value={type}>{type.split(' ')[0]}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${labelClass}`}>জনরা</label>
            <select name="genre" value={settings.genre} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl text-[11px] font-black focus:border-indigo-500 outline-none ${inputBgClass}`}>
              {Object.values(Genre).map(genre => <option key={genre} value={genre}>{genre.split(' ')[0]}</option>)}
            </select>
          </div>
        </section>

        <section className={`space-y-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className={`text-xs font-black uppercase ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>ধারাবাহিকতা</span>
              <span className="text-[10px] text-slate-400 font-bold">{settings.continuityMode === 'strict' ? 'লজিক্যাল (Strict)' : 'ফ্রি-স্টাইল (Flexible)'}</span>
            </div>
            <button onClick={handleToggleContinuity} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${settings.continuityMode === 'strict' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.continuityMode === 'strict' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-xs font-black text-rose-500 uppercase tracking-tighter">১৮+ মোড (Adult)</span>
              <span className="text-[10px] text-slate-400 font-bold">{settings.isMature ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}</span>
            </div>
            <button onClick={handleToggleMature} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${settings.isMature ? 'bg-rose-500' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isMature ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>
      </div>

      <div className="pt-6">
        <button
          onClick={isGenerating ? onStop : onGenerate}
          disabled={!isOnline && !isGenerating}
          className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-95 group relative overflow-hidden ${
            isGenerating 
            ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600' 
            : !isOnline
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
              <span className="bengali-font">থামুন</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span className="bengali-font">{isOnline ? 'গল্প লিখুন' : 'অফলাইন'}</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
