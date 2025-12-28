import React, { useRef, useState, useEffect } from 'react';
import { StorySettings, Theme } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as docx from 'docx';
// @ts-ignore
import FileSaver from 'file-saver';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

const saveAs = (FileSaver as any).saveAs || (FileSaver as any).default || FileSaver;

interface StoryDisplayProps {
  content: string;
  isGenerating: boolean;
  settings: StorySettings;
  onContinue: () => void;
  isOnline: boolean;
}

type FontOption = 'noto' | 'anek' | 'tiro' | 'hind' | 'mina';

const StoryDisplay: React.FC<StoryDisplayProps> = ({ content, isGenerating, settings, onContinue, isOnline }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<number>(22);
  const [fontFamily, setFontFamily] = useState<FontOption>('noto');
  const [pdfFont, setPdfFont] = useState<FontOption>('noto');
  const [marginSize, setMarginSize] = useState<number>(1.0);
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

  const fontClasses = {
    noto: 'font-noto',
    anek: 'font-anek',
    tiro: 'font-tiro',
    hind: 'font-hind',
    mina: 'font-mina'
  };

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const element = printRef.current;
    const opt = {
      margin: marginSize,
      filename: `${settings.title || 'bengali-story'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true, 
        logging: false,
        backgroundColor: theme === 'dark' ? '#0f172a' : theme === 'sepia' ? '#f4ecd8' : '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const exporter = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
    if (exporter) {
      const originalClass = element.className;
      // Force the selected font class for export
      element.className = `${originalClass} ${fontClasses[pdfFont]}`;
      
      exporter().from(element).set(opt).save().then(() => { 
        element.className = originalClass; 
      });
    } else {
      alert("PDF এক্সপোর্টার লোড হচ্ছে না। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।");
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
      }
    } catch (e) { 
      alert("DOCX ফাইল তৈরিতে সমস্যা হয়েছে।"); 
    }
  };

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-100',
    dark: 'bg-[#0f172a] text-slate-300 border-slate-800/50',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#e8dfc5]'
  };

  const fontNames = { 
    noto: 'Noto Sans', 
    anek: 'Anek Bangla', 
    tiro: 'Tiro Bangla', 
    hind: 'Hind Siliguri', 
    mina: 'Mina' 
  };

  return (
    <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 lg:p-12 transition-all duration-700 ${theme === 'dark' ? 'bg-[#020617]' : theme === 'sepia' ? 'bg-[#fdf9f0]' : 'bg-slate-50'}`}>
      <div className={`max-w-4xl mx-auto shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] min-h-[85vh] flex flex-col overflow-hidden border ${themeClasses[theme]} transition-all duration-500 relative ${theme !== 'dark' ? 'paper-texture' : ''}`}>
        
        {/* Floating Settings Bar */}
        <div className={`px-6 py-5 border-b flex flex-col gap-4 sticky top-0 z-40 backdrop-blur-xl transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800/80 bg-[#0f172a]/90' : theme === 'sepia' ? 'border-[#e8dfc5] bg-[#f4ecd8]/90' : 'border-slate-100 bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                {(['light', 'dark', 'sepia'] as Theme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${theme === t ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' : 'border-slate-200'} ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f4ecd8]'}`}
                  />
                ))}
              </div>
              <div className="h-6 w-[1px] bg-slate-200/60 dark:bg-slate-700/60" />
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl transition-all active:scale-90 flex items-center space-x-2.5 ${showSettings ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Reader Engine</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleCopy}
                className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-[0.1em] uppercase transition-all shadow-sm ${copied ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200/60 text-slate-600 dark:text-slate-300'}`}
              >
                {copied ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6 px-4 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/60 block">Typography Style</span>
                <div className="flex flex-wrap gap-2">
                  {(['noto', 'anek', 'tiro', 'hind', 'mina'] as FontOption[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFontFamily(f)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${fontFamily === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
                    >
                      {fontNames[f]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/60 block">Scale ({fontSize}px)</span>
                <div className="flex items-center space-x-6">
                  <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">-</button>
                  <input type="range" min="14" max="42" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer" />
                  <button onClick={() => setFontSize(Math.min(42, fontSize + 2))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">+</button>
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/60 block">Layout Padding</span>
                <input type="range" min="0.2" max="1.5" step="0.1" value={marginSize} onChange={(e) => setMarginSize(parseFloat(e.target.value))} className="w-full accent-indigo-600 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer" />
              </div>
            </div>
          )}
        </div>

        {/* Text Environment */}
        <div className="flex-1 relative z-10">
          <div ref={printRef} style={{ padding: `${marginSize}in` }} className={`h-full ${fontClasses[fontFamily]}`}>
            {isPlaceholder ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-10 p-12 animate-in fade-in duration-1000">
                <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse" />
                   <div className="bg-slate-50 dark:bg-slate-800 p-12 rounded-[3rem] shadow-inner relative z-10 animate-float">
                    <svg className="w-24 h-24 text-indigo-200/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-5xl font-black tracking-tighter bengali-font bg-gradient-to-br from-slate-900 to-slate-400 bg-clip-text text-transparent dark:from-white dark:to-slate-600">গল্পের ভুবনে স্বাগতম</p>
                  <p className="text-sm font-bold opacity-40 uppercase tracking-[0.3em]">Ignite your imagination with AI</p>
                </div>
              </div>
            ) : (
              <article className="max-w-3xl mx-auto space-y-16 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="border-b-[6px] border-indigo-600/10 pb-16 text-center">
                  <h1 className="font-black mb-10 leading-tight drop-shadow-sm tracking-tight" style={{ fontSize: `${fontSize * 1.8}px` }}>
                    {settings.title || "গল্পের শিরোনাম"}
                  </h1>
                  <div className="flex justify-center items-center flex-wrap gap-3">
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-5 py-2 rounded-xl shadow-lg shadow-indigo-200">{settings.type}</span>
                    <span className={`text-[9px] font-black px-5 py-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200/60 text-slate-600'}`}>{settings.genre}</span>
                    <span className={`text-[9px] font-black px-5 py-2 rounded-xl border ${theme === 'dark' ? 'bg-emerald-900/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{settings.topic}</span>
                  </div>
                </header>
                <div 
                  className="story-content whitespace-pre-wrap select-text text-justify px-4 md:px-0 opacity-0 animate-in fade-in fill-mode-forwards duration-1000 delay-300"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '2.8' }}
                >
                  {content}
                  {isGenerating && (
                    <span className="inline-block w-3.5 h-9 bg-indigo-600/80 animate-pulse ml-4 align-middle rounded-full shadow-lg shadow-indigo-100"></span>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>

        {/* Dynamic Controls Footer */}
        {content && !isGenerating && (
          <div className={`p-10 border-t flex flex-col lg:flex-row gap-10 justify-between items-center transition-all duration-500 relative z-20 ${theme === 'dark' ? 'border-slate-800/60 bg-[#0f172a]/95' : theme === 'sepia' ? 'border-[#e8dfc5] bg-[#f4ecd8]/95' : 'border-slate-100 bg-slate-50/95'}`}>
            <button 
              onClick={onContinue} 
              disabled={!isOnline}
              className={`w-full lg:w-auto px-16 py-6 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center justify-center space-x-5 group ${
                isOnline 
                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isOnline && <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>}
              <span>{isOnline ? 'কাহিনীটি আরও এগিয়ে নিন' : 'অফলাইনে কাজ করছে না'}</span>
            </button>
            
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-2.5 rounded-[2rem] border border-slate-200/60 dark:border-slate-700 shadow-xl">
              <div className="flex items-center divide-x divide-slate-100 dark:divide-slate-700">
                <div className="relative group px-1">
                   <button onClick={handleExportPDF} className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200 flex items-center space-x-2">
                     <span>PDF</span>
                     <span className="opacity-30">|</span>
                     <span className="text-[8px] opacity-60">{fontNames[pdfFont]}</span>
                   </button>
                   
                   <div className="absolute bottom-full left-0 mb-4 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-4 group-hover:translate-y-0 z-[100] scale-95 group-hover:scale-100">
                     <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600/50 mb-4 px-2">Export Typography</p>
                     <div className="flex flex-col gap-1.5">
                       {(['noto', 'anek', 'tiro', 'hind', 'mina'] as FontOption[]).map(f => (
                         <button key={f} onClick={() => setPdfFont(f)} className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black transition-all ${pdfFont === f ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                           {fontNames[f]}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>
                
                <button onClick={handleExportDocx} className="px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200 px-8">DOCX</button>
                <button 
                  onClick={() => {
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    if (typeof saveAs === 'function') saveAs(blob, `${settings.title || 'story'}.txt`);
                  }} 
                  className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-200 px-8"
                >
                  TXT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;