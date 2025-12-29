
import React, { useState, useEffect, useRef } from 'react';
import { AppId, LearningModule, SoftwareApp } from '../types';
import { SOFTWARE_CATALOG, MODULES } from '../constants';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (id: AppId) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onLaunch }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine apps and modules for searching
  const searchableItems = [
    ...SOFTWARE_CATALOG.map(app => ({ ...app, type: 'System Utility' })),
    ...MODULES.map(mod => ({ 
      id: mod.id, 
      name: mod.title, 
      icon: mod.icon, 
      description: mod.description, 
      category: mod.category,
      type: 'Knowledge Node'
    }))
  ];

  const results = query.trim() === '' 
    ? searchableItems.slice(0, 5) // Show some defaults/recents when empty
    : searchableItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        onLaunch(results[selectedIndex].id);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onLaunch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/70 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative w-full max-w-3xl bg-[#0a0f1e]/95 rounded-[3rem] border-2 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="absolute inset-0 os-grid opacity-[0.04] pointer-events-none"></div>
        
        <div className="p-8 flex items-center gap-6 border-b border-white/5 bg-white/[0.02] relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
             <i className="fas fa-search text-blue-400 text-xl"></i>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Query Ecosystem..."
            className="flex-1 bg-transparent border-none outline-none text-2xl font-black text-white placeholder-slate-600 font-orbitron uppercase tracking-tight"
          />
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ESC</span>
               <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Abort</span>
             </div>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar p-4 relative z-10">
          {results.length > 0 ? (
            <div className="space-y-2">
              <p className="px-4 py-2 text-[9px] font-black text-blue-500/50 uppercase tracking-[0.4em] font-orbitron">Neural Search Results</p>
              {results.map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => { onLaunch(item.id); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-6 p-5 rounded-3xl transition-all text-left group border-2 ${
                    idx === selectedIndex 
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
                      : 'hover:bg-white/[0.03] border-transparent'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                    idx === selectedIndex ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] border-blue-400' : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}>
                    <i className={`fas ${item.icon} text-xl`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-1">
                      <span className={`font-orbitron font-black uppercase tracking-widest text-base ${
                        idx === selectedIndex ? 'text-white' : 'text-slate-400'
                      }`}>
                        {item.name}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-colors ${
                        idx === selectedIndex ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-600'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <p className={`text-xs truncate font-medium transition-colors ${
                       idx === selectedIndex ? 'text-slate-300' : 'text-slate-600'
                    }`}>{item.description}</p>
                  </div>

                  {idx === selectedIndex && (
                    <div className="flex flex-col items-end gap-1 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] font-orbitron">
                        <span>Initiate Link</span>
                        <i className="fas fa-chevron-right text-[8px] animate-pulse"></i>
                      </div>
                      <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">ENTER KEY</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <i className="fas fa-microchip text-slate-700 text-3xl"></i>
              </div>
              <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em] font-orbitron">Neural Desync: No Matches Found</p>
              <p className="text-slate-600 text-[10px] mt-2 font-bold uppercase tracking-widest">Adjust query parameters for ecosystem recalibration</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-slate-600 relative z-10">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <span className="bg-slate-800 px-2 py-1 rounded-lg text-[9px] font-black border border-white/5 text-slate-400 font-orbitron">↑↓</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Navigate Vectors</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-800 px-2 py-1 rounded-lg text-[9px] font-black border border-white/5 text-slate-400 font-orbitron">ENTER</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Execute Node</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.3em] font-orbitron">Mechdyane Search Core v9.1.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
