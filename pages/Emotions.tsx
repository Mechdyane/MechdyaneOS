
import React, { useState } from 'react';

interface LogEntry {
  id: number;
  mood: string;
  note: string;
  time: string;
  icon: string;
}

const Emotions: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState('focused');
  const [reflection, setReflection] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, mood: 'FOCUSED', note: "Feeling significant progress in Quantum Mechanics modules. Flow state achieved.", time: "2h ago", icon: 'fa-brain' },
    { id: 2, mood: 'INSPIRED', note: "Ideas for a new math visualization tool are sparking.", time: "5h ago", icon: 'fa-lightbulb' }
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
      icon: moodDef?.icon || 'fa-circle'
    };
    setLogs([newLog, ...logs]);
    setReflection('');
    // Visual feedback for save
    alert("Emotional state recorded in neural history.");
  };

  return (
    <div className="p-10 space-y-12 h-full bg-[#020617]/60 overflow-y-auto">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-orbitron font-black text-white mb-3 uppercase tracking-tighter">Emotional Interface</h1>
        <p className="text-slate-400 font-medium max-w-2xl">Mechdyane tracks your emotional dynamics to adjust learning pacing and difficulty in real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-8">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <i className="fas fa-satellite-dish text-blue-400"></i>
            Neural State Input
          </h2>
          
          <div className="grid grid-cols-5 gap-4">
            {moods.map(mood => (
              <button 
                key={mood.type} 
                onClick={() => setSelectedMood(mood.type)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all group ${
                  selectedMood === mood.type 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/20' 
                    : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                <i className={`fas ${mood.icon} text-2xl transition-transform group-hover:scale-110`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest">{mood.type}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Self-Reflection Node</h3>
            <textarea 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[160px] leading-relaxed font-medium transition-all"
              placeholder="What mental pathways are lighting up? Record your cognitive state..."
            ></textarea>
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] text-[10px]"
            >
              Sync Reflection to Core
            </button>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <i className="fas fa-clock-rotate-left text-purple-400"></i>
            Historical Dynamics
          </h2>
          
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="flex gap-6 p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                  <i className={`fas ${log.icon} text-blue-400`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest">{log.mood}</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase">{log.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{log.note}"</p>
                </div>
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-20 text-slate-600 italic">
                 No neural logs detected. Initialize reflection.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Emotions;
