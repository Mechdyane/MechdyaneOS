
import React, { useState } from 'react';

interface SettingsProps {
  wallpaper: string;
  setWallpaper: (w: string) => void;
  focusMode: boolean;
  setFocusMode: (f: boolean) => void;
  pulseSpeed: number;
  setPulseSpeed: (s: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  wallpaper, 
  setWallpaper, 
  focusMode, 
  setFocusMode,
  pulseSpeed,
  setPulseSpeed
}) => {
  const [customUrl, setCustomUrl] = useState('');

  const wallpapers = [
    { 
      id: 'os-grid', 
      label: 'System Matrix', 
      desc: 'Classic Mechdyane schematic grid environment.',
      preview: 'bg-[#0f172a] os-grid' 
    },
    { 
      id: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', 
      label: 'Deep Protocol', 
      desc: 'Minimalist cognitive dark mode for focus.',
      preview: 'bg-[#020617]' 
    },
    { 
      id: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1200', 
      label: 'Synaptic Flow', 
      desc: 'Active productivity node with organic light.',
      preview: 'bg-[#0f172a]' 
    },
    { 
      id: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200', 
      label: 'Event Horizon', 
      desc: 'Deep space exploration aesthetic.',
      preview: 'bg-[#1e1b4b]' 
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setWallpaper(customUrl.trim());
      setCustomUrl('');
      alert("Custom Neural Link established.");
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-16 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="border-b border-white/5 pb-8 relative">
        <h1 className="text-4xl font-orbitron font-black text-white mb-3 uppercase tracking-tighter">System Control</h1>
        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
          Fine-tune your operating environment and personal aesthetic parameters to maximize synaptic focus.
        </p>
        <div className="absolute top-0 right-0 hidden md:block">
           <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Diagnostic Mode: Optimal</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-20">
        {/* Aesthetic Matrix */}
        <section className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <i className="fas fa-palette text-blue-400"></i>
              Aesthetic Matrix
            </h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Select your neural environment profile</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallpapers.map(wp => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={`flex flex-col rounded-[2rem] border transition-all text-left overflow-hidden group relative ${
                  wallpaper === wp.id 
                    ? 'border-blue-500/50 ring-4 ring-blue-500/10' 
                    : 'bg-slate-900/50 border-white/5 hover:border-white/10 shadow-xl'
                }`}
              >
                <div 
                  className={`h-32 w-full transition-transform group-hover:scale-110 duration-1000 bg-cover bg-center ${wp.id.startsWith('http') ? '' : wp.preview}`}
                  style={wp.id.startsWith('http') ? { backgroundImage: `url(${wp.id})` } : {}}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                </div>
                <div className="p-5 bg-slate-900/95 relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-black text-slate-100 uppercase tracking-tighter font-orbitron">{wp.label}</p>
                    {wallpaper === wp.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                        <i className="fas fa-check text-[8px] text-white"></i>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{wp.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSubmit} className="glass p-6 rounded-3xl border-white/5 space-y-4 shadow-2xl">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Neural Link</p>
                <i className="fas fa-link text-slate-600 text-xs"></i>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Paste HD Neural Visualization URL..."
                  className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-blue-500/50 transition-all font-medium text-slate-300"
                />
                <button type="submit" className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
                  Sync
                </button>
             </div>
          </form>
        </section>

        {/* Operational Parameters */}
        <section className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <i className="fas fa-sliders text-purple-400"></i>
              Operational Parameters
            </h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Global Logic & Sync controls</p>
          </div>

          <div className="space-y-4">
            <div className={`glass p-8 rounded-[2rem] border transition-all duration-500 ${focusMode ? 'border-blue-500/30 bg-blue-600/[0.03]' : 'border-white/5'}`}>
              <div className="flex items-center justify-between gap-8 mb-6">
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-100 mb-1 uppercase tracking-tighter font-orbitron">Deep Focus Protocol</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Minimize sensory input. Simplifies UI shaders and mutes non-essential synaptic cues for maximum immersion.
                  </p>
                </div>
                <button 
                  onClick={() => setFocusMode(!focusMode)}
                  className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${focusMode ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white transition-all shadow-xl ${focusMode ? 'left-8' : 'left-1.5'}`}></div>
                </button>
              </div>
              
              <div className="h-[1px] w-full bg-white/5 my-8"></div>

              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synaptic Pulse Speed</p>
                  <span className="text-[10px] font-black text-blue-400 font-orbitron">{pulseSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={pulseSpeed}
                  onChange={(e) => setPulseSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                   <span>Calm (0.5x)</span>
                   <span>Reactive (2.0x)</span>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border border-white/5 flex items-center justify-between gap-8 group hover:border-red-500/30 transition-all">
              <div className="flex-1">
                <p className="text-sm font-black text-red-400 mb-1 uppercase tracking-tighter font-orbitron">Factory Neural Purge</p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Permanently wipe all neural progress and purge local synaptic cache.
                </p>
              </div>
              <button 
                onClick={() => {
                  if(confirm('SYSTEM OVERRIDE REQUIRED: Purge all neural growth data?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest shrink-0 shadow-lg shadow-red-500/5"
              >
                Purge Core
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-slate-900/30 rounded-3xl border border-white/5 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                 <i className="fas fa-shield-halved text-emerald-400 text-xs"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Encryption: Layer 4 Active</span>
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/5 px-3 py-1 rounded-full animate-pulse">Synced</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
