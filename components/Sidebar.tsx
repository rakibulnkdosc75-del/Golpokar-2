
import React from 'react';
import { StorySettings, StoryType, Genre, WritingStyle } from '../types';

interface SidebarProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  onGenerate: () => void;
  onStop: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onGenerate, onStop, onReset, isGenerating }) => {
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
    { id: 'very short', label: 'খুব সংক্ষিপ্ত' },
    { id: 'short', label: 'সংক্ষিপ্ত' },
    { id: 'medium', label: 'মাঝারি' },
    { id: 'long', label: 'বিস্তারিত' },
    { id: 'very long', label: 'খুব বিস্তারিত' },
  ];

  return (
    <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto space-y-6 h-full shadow-sm flex flex-col">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Story Engine Settings</h2>
          <button 
            onClick={onReset}
            disabled={isGenerating}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-30 flex items-center space-x-1 group"
          >
            <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>রিসেট (Reset)</span>
          </button>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">গল্পের শিরোনাম (Title)</label>
          <input
            id="title"
            type="text"
            name="title"
            value={settings.title}
            onChange={handleInputChange}
            placeholder="যেমন: নীল পদ্মের রহস্য"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        <div>
          <label htmlFor="plotHint" className="block text-sm font-semibold text-slate-700 mb-2">গল্পের সূত্র / প্রেক্ষাপট (Plot Hint)</label>
          <textarea
            id="plotHint"
            name="plotHint"
            value={settings.plotHint}
            onChange={handleInputChange}
            placeholder="গল্পের প্রধান ঘটনা বা ধারণা সংক্ষেপে লিখুন (ঐচ্ছিক)..."
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">গল্পের ধরন (Type)</label>
            <select
              id="type"
              name="type"
              value={settings.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            >
              {Object.values(StoryType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-semibold text-slate-700 mb-2">জনরা (Genre)</label>
            <select
              id="genre"
              name="genre"
              value={settings.genre}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            >
              {Object.values(Genre).map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-semibold text-slate-700 mb-2">লেখার শৈলী (Style)</label>
          <select
            id="style"
            name="style"
            value={settings.style}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          >
            {Object.values(WritingStyle).map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">দৈর্ঘ্য (Length)</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-2 gap-2">
            {lengthOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSettings(prev => ({ ...prev, length: opt.id as any }))}
                className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${
                  settings.length === opt.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                } ${opt.id === 'very long' ? 'sm:col-span-1 lg:col-span-2' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">ধারাবাহিকতা (Continuity)</span>
              <span className="text-[10px] text-slate-500">{settings.continuityMode === 'strict' ? 'কঠোর (Strict)' : 'নমনীয় (Flexible)'}</span>
            </div>
            <button
              onClick={handleToggleContinuity}
              aria-label="Toggle Continuity Mode"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                settings.continuityMode === 'strict' ? 'bg-indigo-600' : 'bg-slate-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.continuityMode === 'strict' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">অ্যাডাল্ট সেটিং (18+)</span>
              <span className="text-xs text-slate-500">পরিপক্ব কন্টেন্ট চালু করুন</span>
            </div>
            <button
              onClick={handleToggleMature}
              aria-label="Toggle Mature Content Mode"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                settings.isMature ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isMature ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {settings.isMature && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-[10px] text-red-600 font-bold leading-relaxed">
                সতর্কতা: ১৮+ সেটিং চালু আছে। এটি শুধুমাত্র প্রাপ্তবয়স্কদের জন্য। সাহিত্যিক শৈলী এবং পরিপক্ব কাহিনী তৈরির জন্য এটি আদর্শ।
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={isGenerating ? onStop : onGenerate}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-2 ${
            isGenerating 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>লেখা বন্ধ করুন</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>গল্প জেনারেট করুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
