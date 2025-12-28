import React, { useRef, useState } from 'react';
import { StorySettings, Theme } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as docx from 'docx';
// @ts-ignore
import saveAs from 'file-saver';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

interface StoryDisplayProps {
  content: string;
  isGenerating: boolean;
  settings: StorySettings;
  onContinue: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ content, isGenerating, settings, onContinue }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<number>(22);
  const [marginSize, setMarginSize] = useState<number>(0.75);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const isPlaceholder = !content && !isGenerating;
  const printRef = useRef<HTMLDivElement>(null);

  const wordCount = content ? content.trim().split(/\s+/).length : 0;

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const opt = {
      margin: marginSize,
      filename: `${settings.title || 'story'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // Support both default export and named export for html2pdf
    const exporter = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
    if (exporter) {
      exporter().from(printRef.current).set(opt).save();
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
            new Paragraph({ text: "" }), // spacing
            ...content.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, size: fontSize * 2 })], // docx size is in half-points
              spacing: { line: 400, after: 200 },
            }))
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${settings.title || 'story'}.docx`);
    } catch (e) { 
      console.error("Docx Export Error:", e);
      alert("DOCX ফাইল তৈরিতে সমস্যা হয়েছে।"); 
    }
  };

  const themeClasses = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-slate-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]'
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`max-w-4xl mx-auto shadow-2xl rounded-2xl min-h-[85vh] flex flex-col overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} ${themeClasses[theme]}`}>
        
        {/* Toolbar */}
        <div className={`px-6 py-3 border-b flex flex-col gap-3 sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-white/80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(['light', 'dark', 'sepia'] as Theme[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${theme === t ? 'border-indigo-500 scale-110' : 'border-slate-200'} ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-slate-800' : 'bg-[#f4ecd8]'}`}
                />
              ))}
              <div className="h-5 w-[1px] bg-slate-300 mx-2" />
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all active:scale-90 ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200/50 text-slate-500'}`}
                title="Formatting Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
            <div className="text-[10px] font-black opacity-60 uppercase tracking-widest flex items-center space-x-2">
              <span className="bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-md">{wordCount} শব্দ</span>
              <span className="hidden sm:inline">(Word Count)</span>
            </div>
          </div>

          {showSettings && (
            <div className="flex flex-wrap items-center gap-8 py-3 px-1 border-t border-slate-100/30 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Font Size:</span>
                <input 
                  type="range" min="16" max="36" value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-28 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200"
                />
                <span className="text-xs font-mono font-black w-6">{fontSize}px</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">PDF Margin:</span>
                <input 
                  type="range" min="0.2" max="1.5" step="0.1" value={marginSize} 
                  onChange={(e) => setMarginSize(parseFloat(e.target.value))}
                  className="w-28 accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200"
                />
                <span className="text-xs font-mono font-black w-8">{marginSize}"</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-visible relative">
          <div ref={printRef} style={{ padding: `${marginSize}in` }} className="h-full">
            {isPlaceholder ? (
              <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-20 pointer-events-none">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-3xl font-black uppercase tracking-tighter">একটি নতুন গল্প লিখুন</p>
                <p className="text-sm font-bold">(Start your journey by creating a story)</p>
              </div>
            ) : (
              <article className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <header className="border-b-2 pb-10 text-center border-indigo-500/20 mb-12">
                  <h1 className="font-black mb-6 leading-tight bengali-font" style={{ fontSize: `${fontSize * 1.8}px` }}>
                    {settings.title || "গল্পের শিরোনাম"}
                  </h1>
                  <div className="flex justify-center items-center flex-wrap gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-600 border border-indigo-500/20">
                      {settings.type.split(' ')[0]}
                    </span>
                    <span className="opacity-20">/</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-600 border border-indigo-500/20">
                      {settings.genre.split(' ')[0]}
                    </span>
                    <span className="opacity-20">/</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-600 border border-indigo-500/20">
                      {settings.style.split(' ')[0]}
                    </span>
                  </div>
                </header>
                <div 
                  className="story-content leading-[2.2] whitespace-pre-wrap bengali-font select-text text-justify px-4"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {content}
                  {isGenerating && (
                    <span className="inline-block w-2.5 h-8 bg-indigo-600 animate-pulse ml-2 align-middle rounded-sm"></span>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>

        {content && !isGenerating && (
          <div className={`p-6 border-t flex flex-wrap gap-5 justify-center md:justify-between items-center transition-all ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'}`}>
            <button 
              onClick={onContinue} 
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 flex items-center space-x-3 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>গল্প চালিয়ে যান</span>
            </button>
            <div className="flex items-center space-x-2 bg-indigo-600/5 p-1.5 rounded-2xl border border-indigo-500/10">
              <button 
                onClick={handleExportPDF} 
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95 text-indigo-700"
              >
                PDF
              </button>
              <button 
                onClick={handleExportDocx} 
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95 text-indigo-700"
              >
                Word
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  saveAs(blob, `${settings.title || 'story'}.txt`);
                }} 
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95 text-indigo-700"
              >
                Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;