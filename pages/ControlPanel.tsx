
import React from 'react';

interface ControlPanelProps {
  focusMode: boolean;
  setFocusMode: (f: boolean) => void;
  pulseSpeed: number;
  setPulseSpeed: (s: number) => void;
  isApiEnabled: boolean;
  setIsApiEnabled: (e: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  focusMode, setFocusMode, pulseSpeed, setPulseSpeed, isApiEnabled, setIsApiEnabled 
}) => {
  return (
    <div className="p-8 space-y-8 bg-slate-900/40 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight font-orbitron">Control Center</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global System Parameters</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
          <i className="fas fa-sliders text-blue-400"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle Tiles */}
        <button 
          onClick={() => setFocusMode(!focusMode)}
          className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 text-left ${focusMode ? 'bg-blue-600/20 border-blue-500/40' : 'bg-slate-800/50 border-white/5 hover:border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${focusMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            <i className="fas fa-eye-slash"></i>
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Focus Mode</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{focusMode ? 'Active' : 'Standby'}</p>
          </div>
        </button>

        <button 
          onClick={() => setIsApiEnabled(!isApiEnabled)}
          className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 text-left ${isApiEnabled ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-slate-800/50 border-white/5 hover:border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isApiEnabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
            <i className="fas fa-bolt"></i>
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Neural Link</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{isApiEnabled ? 'Online' : 'Offline'}</p>
          </div>
        </button>
      </div>

      {/* Sliders Area */}
      <div className="bg-slate-800/40 border border-white/5 p-8 rounded-3xl space-y-8 shadow-xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synaptic Pulse Velocity</p>
            <span className="text-xs font-black text-blue-400 font-orbitron">{pulseSpeed}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.1" 
            value={pulseSpeed}
            onChange={(e) => setPulseSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-4 opacity-50 cursor-not-allowed">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audio Feed Level</p>
            <span className="text-xs font-black text-slate-500 font-orbitron">80%</span>
          </div>
          <input 
            type="range" 
            disabled
            className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-not-allowed accent-slate-600"
          />
        </div>
      </div>

      {/* Connectivity Status */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
           <div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">WiFi: Mechdyane_NET_Secure</p>
             <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Signal Strength: Optimal (94ms)</p>
           </div>
        </div>
        <i className="fas fa-chevron-right text-slate-600 text-xs"></i>
      </div>
    </div>
  );
};

export default ControlPanel;
