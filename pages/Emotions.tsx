
import React, { useState } from 'react';

interface LogEntry {
  id: number;
  mood: string;
  note: string;
  time: string;
  icon: string;
  metrics?: {
    focus: number;
    load: number;
    energy: number;
    flow: boolean;
  };
}

const Emotions: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState('focused');
  const [reflection, setReflection] = useState('');
  const [focusLevel, setFocusLevel] = useState(80);
  const [loadLevel, setLoadLevel] = useState(40);
  const [energyLevel, setEnergyLevel] = useState(75);
  const [isFlowState, setIsFlowState] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { 
      id: 1, 
      mood: 'FOCUSED', 
      note: "Feeling significant progress in Quantum Mechanics modules. Flow state achieved.", 
      time: "2h ago", 
      icon: 'fa-brain',
      metrics: { focus: 95, load: 30, energy: 85, flow: true }
    },
    { 
      id: 2, 
      mood: 'INSPIRED', 
      note: "Ideas for a new math visualization tool are sparking.", 
      time: "5h ago", 
      icon: 'fa-lightbulb',
      metrics: { focus: 70, load: 20, energy: 90, flow: false }
    }
  ]);

  const moods = [
    { type: 'focused', icon: 'fa-brain', color: 'blue' },
    { type: 'inspired', icon: 'fa-lightbulb', color: 'amber' },
    { type: 'happy', icon: 'fa-smile', color: 'emerald' },
    { type: 'anxious', icon: 'fa-bolt', color: 'rose' },
    { type: 'tired', icon: 'fa-moon', color: 'indigo' },
  ];

  const handleSave = () => {
    if (!reflection.trim()) return;
    const moodDef = moods.find(m => m.type === selectedMood);
    const newLog: LogEntry = {
      id: Date.now(),
      mood: selectedMood.toUpperCase(),
      note: reflection,
      time: "Just now",
      icon: moodDef?.icon || 'fa-circle',
      metrics: {
        focus: focusLevel,
        load: loadLevel,
        energy: energyLevel,
        flow: isFlowState
      }
    };
    setLogs([newLog, ...logs]);
    setReflection('');
    // Reset inputs
    setIsFlowState(false);
    alert("Neural state and reflection recorded in synaptic history.");
  };

  return (
    <div className="p-6 md:p-10 space-y-12 h-full bg-[#020617]/60 overflow-y-auto custom-scrollbar pb-32">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-3xl md:text-4xl font-orbitron font-black text-white mb-3 uppercase tracking-tighter">Reflector Interface</h1>
        <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
          The Mechdyane Reflector parses your current neural state. Calibrating these parameters helps the OS Core optimize your learning dynamics and assessment friction.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* INPUT SECTION */}
        <section className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <i className="fas fa-satellite-dish text-blue-400"></i>
              Primary Neural Signature
            </h2>
            
            <div className="grid grid-cols-5 gap-3">
              {moods.map(mood => (
                <button 
                  key={mood.type} 
                  onClick={() => setSelectedMood(mood.type)}
                  className={`flex flex-col items-center gap-3 p-4 md:p-6 rounded-3xl border transition-all group ${
                    selectedMood === mood.type 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-900/50 border-white/5 text-slate-600 hover:border-white/10 hover:text-slate-400'
                  }`}
                >
                  <i className={`fas ${mood.icon} text-xl md:text-2xl transition-transform group-hover:scale-110`}></i>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{mood.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SLIDERS FOR NEURAL DATA */}
          <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 font-orbitron">Neural Metrics</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-bullseye text-blue-500 text-[8px]"></i> Focus Density
                  </p>
                  <span className="text-[10px] font-black text-blue-400 font-orbitron">{focusLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={focusLevel}
                  onChange={(e) => setFocusLevel(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-microchip text-purple-500 text-[8px]"></i> Cognitive Load
                  </p>
                  <span className="text-[10px] font-black text-purple-400 font-orbitron">{loadLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={loadLevel}
                  onChange={(e) => setLoadLevel(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-bolt text-emerald-500 text-[8px]"></i> Neural Energy
                  </p>
                  <span className="text-[10px] font-black text-emerald-400 font-orbitron">{energyLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isFlowState ? 'bg-orange-600/20 border-orange-500/40 text-orange-500 shadow-lg shadow-orange-500/10' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                  <i className="fas fa-fire-flame-curved"></i>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isFlowState ? 'text-orange-400' : 'text-slate-600'}`}>Flow State Trigger</span>
              </div>
              <button 
                onClick={() => setIsFlowState(!isFlowState)}
                className={`w-12 h-6 rounded-full transition-all relative ${isFlowState ? 'bg-orange-600 shadow-inner' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${isFlowState ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Self-Reflection Node</h3>
            <textarea 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[140px] leading-relaxed font-medium transition-all custom-scrollbar"
              placeholder="Record your current cognitive bottlenecks or breakthrough insights..."
            ></textarea>
            <button 
              onClick={handleSave}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] text-[10px] font-orbitron"
            >
              Sync Neural Data to Core
            </button>
          </div>
        </section>

        {/* HISTORY SECTION */}
        <section className="space-y-10">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <i className="fas fa-clock-rotate-left text-purple-400"></i>
            Historical Dynamics
          </h2>
          
          <div className="space-y-6">
            {logs.map(log => (
              <div key={log.id} className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all space-y-6 group">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-colors">
                      <i className={`fas ${log.icon} text-blue-400 text-xl`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest">{log.mood}</span>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">{log.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{log.note}"</p>
                    </div>
                  </div>
                </div>

                {log.metrics && (
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Focus</p>
                      <p className="text-xs font-black text-blue-400 font-orbitron">{log.metrics.focus}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Load</p>
                      <p className="text-xs font-black text-purple-400 font-orbitron">{log.metrics.load}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Energy</p>
                      <p className="text-xs font-black text-emerald-400 font-orbitron">{log.metrics.energy}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Flow</p>
                      <p className={`text-xs font-black font-orbitron ${log.metrics.flow ? 'text-orange-500' : 'text-slate-700'}`}>
                        {log.metrics.flow ? 'ENGAGED' : 'OFF'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem]">
                 <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mx-auto text-slate-700 mb-4">
                    <i className="fas fa-ghost text-2xl"></i>
                 </div>
                 <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No neural logs detected. Initialize reflection node.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Emotions;
