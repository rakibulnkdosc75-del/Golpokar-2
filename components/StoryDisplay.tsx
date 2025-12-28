
import React, { useRef, useState, useEffect } from 'react';
import { StorySettings, Theme } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as docx from 'docx';
// @ts-ignore
import FileSaver from 'file-saver';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

// Robust ESM check for saveAs
const saveAs = (FileSaver as any).saveAs || (FileSaver as any).default || FileSaver;

interface StoryDisplayProps {
  content: string;
  isGenerating: boolean;
  settings: StorySettings;
  onContinue: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ content, isGenerating, settings, onContinue }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<number>(20);
  const [marginSize, setMarginSize] = useState<number>(0.75);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  
  const isPlaceholder = !content && !isGenerating;
  const printRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [content, isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const opt = {
      margin: marginSize,
      filename: `${settings.title || 'bengali-story'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    const exporter = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
    if (exporter) {
      exporter().from(printRef.current).set(opt).save();
    } else {
      alert("PDF এক্সপোর্টার লোড হচ্ছে না, অনুগ্রহ করে একটু পর চেষ্টা করুন।");
    }
  };

  const handleExportDocx = async () => {
    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ 
              text: settings.title || "গল্পের শিরোনাম", 
              heading: HeadingLevel.TITLE, 
              alignment: AlignmentType.CENTER 
            }),
            new Paragraph({ text: "" }), 
            ...content.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, size: fontSize * 2 })],
              spacing: { line: 400, after: 200 },
            }))
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      if (typeof saveAs === 'function') {
        saveAs(blob, `${settings.title || 'story'}.docx`);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${settings.title || 'story'}.docx`;
        link.click();
      }
    } catch (e) { 
      console.error("Docx Error:", e);
      alert("DOCX ফাইল তৈরিতে সমস্যা হয়েছে।"); 
    }
  };

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-100',
    dark: 'bg-[#1a1c24] text-slate-200 border-slate-800',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#e8dfc5]'
  };

  return (
    <div ref={scrollRef} className={`flex-1 overflow-y-auto p-2 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f1115]' : theme === 'sepia' ? 'bg-[#fdf9f0]' : 'bg-slate-50'}`}>
      <div className={`max-w-4xl mx-auto shadow-2xl rounded-3xl min-h-[90vh] flex flex-col overflow-hidden border ${themeClasses[theme]}`}>
        
        <div className={`px-4 md:px-6 py-4 border-b flex flex-col gap-4 sticky top-0 z-10 backdrop-blur-xl ${theme === 'dark' ? 'border-slate-800 bg-[#1a1c24]/90' : theme === 'sepia' ? 'border-[#e8dfc5] bg-[#f4ecd8]/90' : 'border-slate-100 bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              {(['light', 'dark', 'sepia'] as Theme[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${theme === t ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'} ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-slate-800' : 'bg-[#f4ecd8]'}`}
                />
              ))}
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all active:scale-90 ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}
              >
                {copied ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="flex flex-wrap items-center gap-6 py-4 px-2 border-t border-slate-100/50 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">ফন্ট সাইজ</span>
                <input 
                  type="range" min="14" max="42" value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-32 accent-indigo-600 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold w-6">{fontSize}px</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">মার্জিন</span>
                <input 
                  type="range" min="0.2" max="1.5" step="0.1" value={marginSize} 
                  onChange={(e) => setMarginSize(parseFloat(e.target.value))}
                  className="w-32 accent-indigo-600 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold w-8">{marginSize}"</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-visible relative scroll-smooth">
          <div ref={printRef} style={{ padding: `${marginSize}in` }} className="h-full">
            {isPlaceholder ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 opacity-25 p-6 animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-700 p-8 rounded-full">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-black uppercase tracking-tighter bengali-font">গল্পের ভুবনে স্বাগতম</p>
                  <p className="text-sm font-bold opacity-60">পাশের সেটিংস পূরণ করে আপনার কল্পনাকে রূপ দিন</p>
                </div>
              </div>
            ) : (
              <article className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <header className="border-b-4 border-indigo-600/30 pb-12 text-center mb-16">
                  <h1 className="font-black mb-8 leading-tight bengali-font drop-shadow-sm" style={{ fontSize: `${fontSize * 1.8}px` }}>
                    {settings.title || "গল্পের শিরোনাম"}
                  </h1>
                  <div className="flex justify-center items-center flex-wrap gap-4">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-indigo-600/20">{settings.type}</span>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>{settings.genre}</span>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-emerald-900/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{settings.topic}</span>
                  </div>
                </header>
                <div 
                  className="story-content leading-[2.6] whitespace-pre-wrap bengali-font select-text text-justify px-4 md:px-0"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {content}
                  {isGenerating && (
                    <span className="inline-block w-3 h-8 bg-indigo-600 animate-pulse ml-3 align-middle rounded-full shadow-sm"></span>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>

        {content && !isGenerating && (
          <div className={`p-6 md:p-10 border-t flex flex-col md:flex-row gap-8 justify-between items-center transition-all ${theme === 'dark' ? 'border-slate-800 bg-[#1a1c24]/90' : theme === 'sepia' ? 'border-[#e8dfc5] bg-[#f4ecd8]/90' : 'border-slate-100 bg-slate-50/90'}`}>
            <button 
              onClick={onContinue} 
              className="w-full md:w-auto bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl hover:shadow-indigo-500/30 active:scale-95 flex items-center justify-center space-x-4 group"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>গল্পটি চালিয়ে যান</span>
            </button>
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-700 p-2 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm">
              <button onClick={handleExportPDF} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200">PDF</button>
              <button onClick={handleExportDocx} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200">DOCX</button>
              <button 
                onClick={() => {
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  if (typeof saveAs === 'function') saveAs(blob, `${settings.title || 'story'}.txt`);
                }} 
                className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200"
              >
                TEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
