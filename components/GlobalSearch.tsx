
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
    ...SOFTWARE_CATALOG.map(app => ({ ...app, type: 'App' })),
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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative w-full max-w-2xl glass rounded-[2rem] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-white/5">
          <i className="fas fa-search text-blue-400 text-lg"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search apps, modules, or system tools..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-white placeholder-slate-500"
          />
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] font-black text-slate-500 uppercase">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => { onLaunch(item.id); onClose(); }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                  idx === selectedIndex ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  idx === selectedIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-blue-400/30' : 'bg-slate-900 border-white/5 text-slate-400'
                }`}>
                  <i className={`fas ${item.icon} text-lg`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`font-orbitron font-black uppercase tracking-tight text-sm ${
                      idx === selectedIndex ? 'text-white' : 'text-slate-300'
                    }`}>
                      {item.name}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      idx === selectedIndex ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1 font-medium">{item.description}</p>
                </div>

                {idx === selectedIndex && (
                  <div className="hidden md:flex items-center gap-2 text-blue-400 font-black text-[9px] uppercase tracking-widest animate-in slide-in-from-right-2">
                    <span>Launch</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-microchip text-slate-600 text-xl"></i>
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching neural patterns found</p>
              <p className="text-slate-600 text-[10px] mt-1">Try searching for 'Assistant' or 'ICT'</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-between text-slate-500">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/5">↑↓</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/5">ENTER</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Open</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.2em] font-orbitron">Mechdyane Search Core</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
