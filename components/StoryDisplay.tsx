
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
  onContentChange: (newContent: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

type FontOption = 'noto' | 'anek' | 'tiro' | 'hind' | 'mina';

const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  content, 
  isGenerating, 
  settings, 
  onContinue, 
  isOnline, 
  onContentChange, 
  theme, 
  onThemeChange 
}) => {
  const [fontSize, setFontSize] = useState<number>(22);
  const [fontFamily, setFontFamily] = useState<FontOption>('noto');
  const [pdfFont, setPdfFont] = useState<FontOption>('noto');
  const [marginSize, setMarginSize] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  
  const isPlaceholder = !content && !isGenerating;
  const printRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with safety check to prevent jumping
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [content, fontSize, marginSize, theme]);

  // Smooth scroll to bottom during generation
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

  // REFINED THEME COLORS FOR LONG READING SESSIONS
  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-100',
    dark: 'bg-[#020617] text-[#cbd5e1] border-slate-800/50', // Optimized contrast
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#e8dfc5]'
  };

  const fontNames = { 
    noto: 'Noto Sans', 
    anek: 'Anek Bangla', 
    tiro: 'Tiro Bangla', 
    hind: 'Hind Siliguri', 
    mina: 'Mina' 
  };

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const element = printRef.current;
    const opt = {
      margin: marginSize,
      filename: `${settings.title || 'bengali-story'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        logging: false,
        backgroundColor: theme === 'dark' ? '#020617' : theme === 'sepia' ? '#f4ecd8' : '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const exporter = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
    if (exporter) {
      const originalClass = element.className;
      element.className = `${originalClass} ${fontClasses[pdfFont]}`;
      exporter().from(element).set(opt).save().then(() => { 
        element.className = originalClass; 
      });
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
            ...content.split('\n').map(line => new Paragraph({
              children: [new TextRun({ 
                text: line, 
                size: fontSize * 2, 
                color: theme === 'dark' ? 'CBD5E1' : '1E293B' 
              })],
              spacing: { line: 400, after: 200 },
            }))
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      if (typeof saveAs === 'function') saveAs(blob, `${settings.title || 'story'}.docx`);
    } catch (e) { console.error("Docx Error", e); }
  };

  return (
    <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 lg:p-12 transition-all duration-700 ${theme === 'dark' ? 'bg-[#000000]' : theme === 'sepia' ? 'bg-[#fdf9f0]' : 'bg-slate-50'}`}>
      <div className={`max-w-4xl mx-auto shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-[3rem] min-h-[85vh] flex flex-col border transition-all duration-500 relative ${themeClasses[theme]} ${theme !== 'dark' ? 'paper-texture' : ''}`}>
        
        {/* Superior Control Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800/80 bg-[#020617]/95' : theme === 'sepia' ? 'border-[#e8dfc5] bg-[#f4ecd8]/95' : 'border-slate-100 bg-white/95'}`}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {(['light', 'dark', 'sepia'] as Theme[]).map(t => (
                <button 
                  key={t} 
                  onClick={() => onThemeChange(t)} 
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${theme === t ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-200'} ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-[#020617]' : 'bg-[#f4ecd8]'}`} 
                  aria-label={`Switch to ${t} theme`}
                />
              ))}
            </div>
            <div className={`h-6 w-[1px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${showSettings ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-indigo-600/10 text-slate-400 hover:text-indigo-600'}`}
              title="Typography & Reading Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
            <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="hidden sm:inline">{isOnline ? 'Safe Cloud Editor' : 'Offline Draft Active'}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCopy} 
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : theme === 'dark' ? 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800' : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'}`}
          >
            {copied ? 'Copied!' : 'Copy Content'}
          </button>
        </div>

        {showSettings && (
          <div className={`p-8 border-b grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-top-4 duration-500 ${theme === 'dark' ? 'border-slate-800 bg-[#020617]/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.25em]">Typeface Selection</span>
              <div className="flex flex-wrap gap-2">
                {(['noto', 'anek', 'tiro', 'hind', 'mina'] as FontOption[]).map(f => (
                  <button key={f} onClick={() => setFontFamily(f)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${fontFamily === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>{fontNames[f]}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.25em]">Reading Scale ({fontSize}px)</span>
              <div className="flex items-center space-x-4">
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">-</button>
                <input type="range" min="14" max="42" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700" />
                <button onClick={() => setFontSize(Math.min(42, fontSize + 2))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">+</button>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.25em]">Hard Copy Assets</span>
              <div className="flex items-center space-x-3">
                <button onClick={handleExportPDF} className="flex-1 py-3 bg-indigo-600/10 text-indigo-500 rounded-xl text-[10px] font-black tracking-widest hover:bg-indigo-600 hover:text-white transition-all">EXPORT PDF</button>
                <button onClick={handleExportDocx} className="flex-1 py-3 bg-indigo-600/10 text-indigo-500 rounded-xl text-[10px] font-black tracking-widest hover:bg-indigo-600 hover:text-white transition-all">EXPORT DOCX</button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Canvas Area */}
        <div className="flex-1 relative p-6 lg:p-14 overflow-visible">
          <div ref={printRef} style={{ padding: `${marginSize}in` }} className={`min-h-full transition-all duration-700 ${fontClasses[fontFamily]}`}>
            {isPlaceholder ? (
              <div className="h-[65vh] flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className={`${theme === 'dark' ? 'bg-slate-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-slate-50'} p-16 rounded-[4rem] animate-float relative`}>
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-5 rounded-full" />
                  <svg className="w-24 h-24 text-indigo-500/20 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={1}/></svg>
                </div>
                <div className="space-y-5">
                  <h2 className="text-6xl font-black bengali-font bg-gradient-to-br from-indigo-500 via-indigo-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm tracking-tighter">গল্পের ভুবন</h2>
                  <p className="text-slate-500 font-bold text-base tracking-widest uppercase opacity-60">Architect your masterpiece with AI</p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <header className={`border-b-4 pb-12 mb-16 text-center transition-colors ${theme === 'dark' ? 'border-indigo-600/10' : 'border-indigo-600/5'}`}>
                  <h1 className="font-black mb-8 leading-tight tracking-tight drop-shadow-xl" style={{ fontSize: `${fontSize * 1.8}px` }}>{settings.title || "নতুন গল্প"}</h1>
                  <div className="flex justify-center items-center flex-wrap gap-4">
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">{settings.type}</span>
                    <span className={`text-[9px] font-black px-6 py-2.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>{settings.genre}</span>
                  </div>
                </header>
                
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    disabled={isGenerating}
                    placeholder="আপনার গল্পের প্রেক্ষাপট এখানে ফুটে উঠবে..."
                    className="w-full bg-transparent border-none focus:ring-0 resize-none overflow-hidden transition-all duration-300 placeholder:opacity-20 placeholder:text-slate-400 leading-relaxed text-justify"
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      lineHeight: '2.6', // Optimized for Bengali reading
                      fontFamily: 'inherit',
                      color: 'inherit'
                    }}
                  />
                  {isGenerating && (
                    <div className="flex items-center space-x-4 mt-8 py-6 border-t border-indigo-600/10 animate-in fade-in slide-in-from-left duration-500">
                      <div className="flex space-x-1.5">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">AI Synthesis in motion...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Story Footer */}
        {content && !isGenerating && (
          <div className={`p-10 border-t flex flex-col lg:flex-row gap-8 justify-between items-center transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800 bg-[#020617]/95 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'bg-slate-50/95 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'}`}>
            <button 
              onClick={onContinue} 
              disabled={!isOnline} 
              className={`w-full lg:w-auto px-20 py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-6 group ${isOnline ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20' : theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <svg className="w-8 h-8 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{isOnline ? 'কাহিনীটি আরও এগিয়ে নিন' : 'অফলাইন মোড'}</span>
            </button>
            <div className={`flex items-center space-x-3 px-8 py-4 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Auto-Saved to Storage</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
