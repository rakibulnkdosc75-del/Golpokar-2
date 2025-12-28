
import React, { useRef, useState } from 'react';
import { StorySettings, Theme } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import * as docx from 'docx';
// @ts-ignore
import * as FileSaver from 'file-saver';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
const saveAs = (FileSaver as any).saveAs || (FileSaver as any).default?.saveAs || (window as any).saveAs;

interface StoryDisplayProps {
  content: string;
  isGenerating: boolean;
  settings: StorySettings;
  onContinue: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ content, isGenerating, settings, onContinue }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const isPlaceholder = !content && !isGenerating;
  const printRef = useRef<HTMLDivElement>(null);

  const wordCount = content ? content.trim().split(/\s+/).length : 0;

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const opt = {
      margin: 0.5,
      filename: `${settings.title || 'story'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(printRef.current).set(opt).save();
  };

  const handleExportDocx = async () => {
    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: settings.title || "গল্প", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
            ...content.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, size: 28 })],
              spacing: { line: 360, after: 200 },
            }))
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${settings.title || 'story'}.docx`);
    } catch (e) { alert("DOCX export failed."); }
  };

  const themeClasses = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-slate-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]'
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`max-w-3xl mx-auto shadow-2xl rounded-2xl min-h-[85vh] flex flex-col overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} ${themeClasses[theme]}`}>
        
        {/* Toolbar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex space-x-2">
            {(['light', 'dark', 'sepia'] as Theme[]).map(t => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${theme === t ? 'border-indigo-500 scale-110' : 'border-transparent'} ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-slate-800' : 'bg-[#f4ecd8]'}`}
              />
            ))}
          </div>
          <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
            {wordCount} শব্দ (Words)
          </div>
        </div>

        <div ref={printRef} className="p-8 md:p-14 flex-1">
          {isPlaceholder ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-32 opacity-40">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-xl font-medium">নতুন গল্প তৈরি করুন</p>
            </div>
          ) : (
            <article className="space-y-8 animate-in fade-in duration-500">
              <header className="border-b pb-8 text-center border-current opacity-80">
                <h1 className="text-3xl md:text-5xl font-black mb-4">{settings.title || "গল্পের শিরোনাম"}</h1>
                <div className="text-sm font-bold opacity-70 uppercase tracking-widest">{settings.type} • {settings.genre} • {settings.style}</div>
              </header>
              <div className="story-content text-xl md:text-2xl leading-[2.2] whitespace-pre-wrap bengali-font select-text text-justify px-2">
                {content}
                {isGenerating && <span className="inline-block w-2 h-7 bg-indigo-500 animate-pulse ml-1 align-middle"></span>}
              </div>
            </article>
          )}
        </div>

        {content && !isGenerating && (
          <div className={`p-6 border-t flex flex-wrap gap-3 justify-center md:justify-end items-center ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <button onClick={onContinue} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>পরবর্তী অংশ লিখুন</span>
            </button>
            <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur">
              <button onClick={handleExportPDF} className="px-3 py-2 hover:bg-white/10 rounded">PDF</button>
              <button onClick={handleExportDocx} className="px-3 py-2 hover:bg-white/10 rounded">DOCX</button>
              <button onClick={() => {
                const blob = new Blob([content], { type: 'text/plain' });
                saveAs(blob, `${settings.title || 'story'}.txt`);
              }} className="px-3 py-2 hover:bg-white/10 rounded">TXT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
