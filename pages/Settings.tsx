
import React, { useState, useRef } from 'react';

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
  const [activeTab, setActiveTab] = useState<'visual' | 'system' | 'neural'>('visual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wallpapers = [
    { 
      id: 'os-grid', 
      label: 'System Matrix', 
      desc: 'Classic Mechdyane schematic grid environment.',
      preview: 'bg-[#0f172a]' 
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
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setWallpaper(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="border-b border-white/5 pb-8 relative">
        <h1 className="text-4xl font-orbitron font-black text-white mb-3 uppercase tracking-tighter">System Control</h1>
        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed text-sm">
          Fine-tune your operating environment and personal aesthetic parameters to maximize synaptic focus and cognitive efficiency.
        </p>
        
        <div className="flex gap-4 mt-10 overflow-x-auto no-scrollbar pb-2">
           {[
             { id: 'visual', label: 'Visual Interface', icon: 'fa-palette' },
             { id: 'system', label: 'Operational Hub', icon: 'fa-microchip' },
             { id: 'neural', label: 'Synaptic Engine', icon: 'fa-brain' },
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-3 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
             >
               <i className={`fas ${tab.icon} text-xs`}></i>
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'visual' && (
        <section className="space-y-10 animate-in fade-in duration-500">
          <div className="space-y-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <i className="fas fa-image text-blue-400"></i>
              Environment Profiles
            </h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Select your neural environment profile</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Native Pre-sets */}
            {wallpapers.map(wp => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={`flex flex-col rounded-[2rem] border transition-all text-left overflow-hidden group relative ${
                  wallpaper === wp.id 
                    ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-900/50 border-white/5 hover:border-white/10 shadow-xl'
                }`}
              >
                <div 
                  className={`h-32 w-full transition-transform group-hover:scale-110 duration-1000 bg-cover bg-center relative ${wp.id.startsWith('http') || wp.id.startsWith('data:') ? '' : wp.preview}`}
                  style={wp.id.startsWith('http') || wp.id.startsWith('data:') ? { backgroundImage: `url(${wp.id})` } : {}}
                >
                  {wp.id === 'os-grid' && (
                    <div className="absolute inset-0 os-grid opacity-30"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                </div>
                <div className="p-5 bg-slate-900/95 relative flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-black text-slate-100 uppercase tracking-tighter font-orbitron">{wp.label}</p>
                    {wallpaper === wp.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                        <i className="fas fa-check text-[8px] text-white"></i>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{wp.desc}</p>
                </div>
              </button>
            ))}

            {/* Local Upload Trigger */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/40 transition-all text-center items-center justify-center min-h-[180px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-4">
                <i className="fas fa-cloud-arrow-up text-xl"></i>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-orbitron group-hover:text-white transition-colors">Upload Local Asset</p>
              <p className="text-[8px] text-slate-600 font-bold uppercase mt-2">JPG, PNG, GIF (Max 5MB)</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleCustomSubmit} className="glass p-8 rounded-[2rem] border border-white/5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External Neural Link (Cloud URL)</p>
                  <i className="fas fa-link text-slate-600 text-xs"></i>
              </div>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="Paste environment URL..."
                    className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-[11px] focus:outline-none focus:border-blue-500/50 transition-all font-medium text-slate-300"
                  />
                  <button type="submit" className="px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
                    Link
                  </button>
              </div>
            </form>

            <div className="glass p-8 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-2xl">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <i className="fas fa-shield-check"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Asset Status</p>
                    <p className="text-xs text-slate-500 font-medium">Environment is currently synchronized and persisted to synaptic memory.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'system' && (
        <section className="space-y-10 animate-in fade-in duration-500">
           <div className="space-y-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <i className="fas fa-cog text-purple-400"></i>
              System Mechanics
            </h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Global Logic & Interaction Parameters</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className={`glass p-8 rounded-[2.5rem] border transition-all duration-500 ${focusMode ? 'border-blue-500/30 bg-blue-600/[0.03]' : 'border-white/5'}`}>
                <div className="flex items-center justify-between gap-8 mb-6">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-100 mb-1 uppercase tracking-tighter font-orbitron">Deep Focus Protocol</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Optimize focus by applying global grayscale filters and muting non-essential synaptic cues for maximum cognitive immersion.
                    </p>
                  </div>
                  <button 
                    onClick={() => setFocusMode(!focusMode)}
                    className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${focusMode ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white transition-all shadow-xl ${focusMode ? 'left-8' : 'left-1.5'}`}></div>
                  </button>
                </div>
                <div className="h-[1px] w-full bg-white/5 my-6"></div>
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <i className="fas fa-info-circle text-blue-500/50"></i>
                  Status: {focusMode ? 'Optimizing Neural Paths' : 'Awaiting Protocol Entry'}
                </div>
             </div>

             <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-red-500/30 transition-all">
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1">
                    <p className="text-sm font-black text-red-400 mb-1 uppercase tracking-tighter font-orbitron">Factory Neural Purge</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Permanently wipe all neural progress and purge local synaptic cache. This operation cannot be reversed.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                     <i className="fas fa-radiation"></i>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if(confirm('SYSTEM OVERRIDE REQUIRED: Purge all neural growth data?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="mt-8 px-6 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest shadow-lg shadow-red-500/5"
                >
                  Purge Synaptic Core
                </button>
             </div>
          </div>
        </section>
      )}

      {activeTab === 'neural' && (
        <section className="space-y-10 animate-in fade-in duration-500">
           <div className="space-y-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <i className="fas fa-microchip text-emerald-400"></i>
              Engine Configuration
            </h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Neural Link & Model Synchronization</p>
          </div>

          <div className="bg-[#0f172a]/60 p-10 rounded-[3rem] border border-white/5 space-y-10">
             <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3 space-y-4">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                      <i className="fas fa-robot text-2xl"></i>
                   </div>
                   <h3 className="text-xl font-black text-white font-orbitron uppercase tracking-tighter">Gemini v3 Core</h3>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-medium">The primary cognitive engine responsible for curriculum synthesis and adaptive feedback logic.</p>
                </div>
                
                <div className="flex-1 space-y-6">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Pulse Speed</label>
                        <span className="text-xs font-black text-emerald-400 font-orbitron">{pulseSpeed}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.5" 
                        step="0.1" 
                        value={pulseSpeed}
                        onChange={(e) => setPulseSpeed(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between text-[7px] font-black text-slate-700 uppercase">
                        <span>Energy Efficient (0.5x)</span>
                        <span>Hyper-Responsive (2.5x)</span>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-help">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Latency</span>
                         <span className="text-[10px] font-black text-emerald-500 font-orbitron">24ms</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                         <span className="text-[10px] font-black text-blue-400 font-orbitron">99.98%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl">
             <i className="fas fa-shield-halved text-blue-400 text-xl"></i>
             <div className="flex-1">
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Neural Security Protocols Active</p>
                <p className="text-[9px] text-slate-500 font-medium">All synaptic data is encrypted with SHA-256 Neural Ciphers before transmission.</p>
             </div>
             <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse">Protected</span>
          </div>
        </section>
      )}

      <footer className="pt-20 text-center opacity-30">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] font-orbitron">Mechdyane Core Integration Terminal</p>
        <p className="text-[8px] text-slate-700 font-bold uppercase mt-2">Firmware Version: 9.1.4-Adaptive</p>
      </footer>
    </div>
  );
};

export default Settings;
