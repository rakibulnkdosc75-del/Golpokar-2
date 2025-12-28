import React from 'react';
import { StorySettings, StoryType, Genre, WritingStyle } from '../types';

interface SidebarProps {
  settings: StorySettings;
  setSettings: React.Dispatch<React.SetStateAction<StorySettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onGenerate, isGenerating }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setSettings(prev => ({ ...prev, isMature: !prev.isMature }));
  };

  const lengthOptions = [
    { id: 'very short', label: 'খুব সংক্ষিপ্ত' },
    { id: 'short', label: 'সংক্ষিপ্ত' },
    { id: 'medium', label: 'মাঝারি' },
    { id: 'long', label: 'বিস্তারিত' },
    { id: 'very long', label: 'খুব বিস্তারিত' },
  ];

  return (
    <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto space-y-6 h-full shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">গল্পের শিরোনাম (Title)</label>
        <input
          type="text"
          name="title"
          value={settings.title}
          onChange={handleInputChange}
          placeholder="যেমন: শেষ বিকেলের মেঘ"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">গল্পের সূত্র / প্রেক্ষাপট (Plot Hint)</label>
        <textarea
          name="plotHint"
          value={settings.plotHint}
          onChange={handleInputChange}
          placeholder="গল্পের প্রধান ঘটনা বা ধারণা সংক্ষেপে লিখুন (ঐচ্ছিক)..."
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none text-sm"
        />
        <p className="text-[10px] text-slate-400 mt-1">AI-কে গল্পের দিকনির্দেশনা দিতে এটি ব্যবহার করুন।</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">গল্পের ধরন (Type)</label>
        <select
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">জনরা (Genre)</label>
        <select
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

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">লেখার শৈলী (Style)</label>
        <select
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
        <div className="grid grid-cols-2 gap-2">
          {lengthOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSettings(prev => ({ ...prev, length: opt.id as any }))}
              className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                settings.length === opt.id 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              } ${opt.id === 'very long' ? 'col-span-2' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">অ্যাডাল্ট সেটিং (18+)</span>
            <span className="text-xs text-slate-500">পরিপক্ব কন্টেন্ট চালু করুন</span>
          </div>
          <button
            onClick={handleToggle}
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
          <div className="p-3 bg-red-50 rounded-lg mb-4">
            <p className="text-[10px] text-red-600 font-medium leading-relaxed">
              সতর্কতা: ১৮+ সেটিং চালু করা হয়েছে। এতে পরিপক্ব বিষয়ের অবতারণা হতে পারে।
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
          isGenerating 
          ? 'bg-indigo-400 cursor-not-allowed text-white' 
          : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>লিখছে...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>গল্প তৈরি করুন</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Sidebar;