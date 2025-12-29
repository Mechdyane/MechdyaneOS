
import React, { useState, useEffect } from 'react';

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
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  useEffect(() => {
    // Fixed: Explicitly type events to match the allowed literal types for the logs state
    const events: { msg: string; type: 'info' | 'warn' | 'success' }[] = [
      { msg: "Neural Link Synchronized", type: 'success' },
      { msg: "Synaptic Cache Flushed", type: 'info' },
      { msg: "Latent Data Stream Optimized", type: 'success' },
      { msg: "Cognitive Load Balancing...", type: 'info' },
      { msg: "Neural Firewall Active", type: 'success' },
      { msg: "Minor Packet Fragmentation Detected", type: 'warn' },
    ];

    const interval = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [{ ...event, time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...prev].slice(0, 8));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const setFrequency = (f: number) => {
    setPulseSpeed(f);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-900/40 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight font-orbitron">Control Center</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global System Parameters</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <i className="fas fa-sliders text-blue-400"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle Tiles */}
        <button 
          onClick={() => setFocusMode(!focusMode)}
          className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 text-left group ${focusMode ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/10' : 'bg-slate-800/50 border-white/5 hover:border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${focusMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 group-hover:text-slate-200'}`}>
            <i className="fas fa-eye-slash text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Focus Protocol</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${focusMode ? 'text-blue-400' : 'text-slate-500'}`}>
              {focusMode ? 'Engaged' : 'Standby'}
            </p>
          </div>
        </button>

        <button 
          onClick={() => setIsApiEnabled(!isApiEnabled)}
          className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 text-left group ${isApiEnabled ? 'bg-emerald-600/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/50 border-white/5 hover:border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isApiEnabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-400 group-hover:text-slate-200'}`}>
            <i className="fas fa-bolt text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Neural Core Link</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isApiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isApiEnabled ? 'Active' : 'Offline'}
            </p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders Area */}
        <div className="bg-slate-800/40 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-xl">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-orbitron">Synaptic Frequency</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-400 font-orbitron">{pulseSpeed.toFixed(1)}x</span>
                <i className="fas fa-tachometer-alt text-blue-500/50 text-[10px]"></i>
              </div>
            </div>
            
            <input 
              type="range" 
              min="0.2" 
              max="3.0" 
              step="0.1" 
              value={pulseSpeed}
              onChange={(e) => setPulseSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Idle', val: 0.5 },
                { label: 'Normal', val: 1.0 },
                { label: 'Boost', val: 2.0 }
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => setFrequency(p.val)}
                  className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${pulseSpeed === p.val ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <i className="fas fa-battery-three-quarters text-[10px]"></i>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Mode</p>
            </div>
            <div className="text-[10px] font-black text-emerald-500 font-orbitron uppercase">Optimal</div>
          </div>
        </div>

        {/* Neural Event Log */}
        <div className="bg-[#0f172a]/60 border border-white/5 p-8 rounded-[2.5rem] flex flex-col h-[320px] shadow-2xl">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2">
               <i className="fas fa-terminal text-blue-500/50 text-[8px]"></i>
               Neural Event Log
             </h3>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {logs.length > 0 ? logs.map((log, i) => (
               <div key={i} className="flex items-start gap-4 animate-in slide-in-from-left-2 duration-300">
                  <span className="text-[8px] font-black text-slate-600 font-orbitron whitespace-nowrap mt-0.5">{log.time}</span>
                  <p className={`text-[10px] font-bold tracking-tight leading-tight ${
                    log.type === 'success' ? 'text-emerald-400' : 
                    log.type === 'warn' ? 'text-amber-400' : 'text-blue-300'
                  }`}>
                    {log.msg}
                  </p>
               </div>
             )) : (
               <div className="h-full flex items-center justify-center text-[9px] font-black text-slate-700 uppercase tracking-widest">
                 Awaiting System Input...
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isApiEnabled ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-600'}`}>
             <i className="fas fa-wifi text-xs"></i>
           </div>
           <div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Network Link: Mechdyane_NET_Secure</p>
             <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Throughput: {isApiEnabled ? '1.2 GB/s' : 'Static Loop Only'} • Latency: 24ms</p>
           </div>
        </div>
        <button className="text-[9px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
          Manage Connections <i className="fas fa-chevron-right text-[7px]"></i>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
