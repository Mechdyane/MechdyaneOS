
import React, { useState, useEffect, useRef } from 'react';

const FocusTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const timerRef = useRef<number | null>(null);

  const totalSeconds = mode === 'focus' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const percentage = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          handleComplete();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleComplete = () => {
    setIsActive(false);
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setMinutes(newMode === 'focus' ? 25 : 5);
    setSeconds(0);
    alert(`${mode.toUpperCase()} Protocol Complete. Switching to ${newMode.toUpperCase()} mode.`);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="p-8 h-full bg-[#020617]/40 flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-orbitron">Focus Timer</h2>
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Synaptic Pacing Protocol</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-900"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - percentage / 100)}
            className={`${mode === 'focus' ? 'text-blue-500' : 'text-emerald-500'} transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]`}
          />
        </svg>

        <div className="relative z-10 text-center">
          <div className="text-6xl font-black font-orbitron text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-widest mt-2 ${mode === 'focus' ? 'text-blue-400' : 'text-emerald-400'}`}>
            {mode === 'focus' ? 'Concentration Layer' : 'Restoration Layer'}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${
            isActive ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20'
          }`}
        >
          <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
          {isActive ? 'Suspend' : 'Initialize'}
        </button>
        <button 
          onClick={resetTimer}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
        >
          <i className="fas fa-rotate-left mr-2"></i> Reset
        </button>
      </div>

      <div className="flex gap-2">
        {(['focus', 'break'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setMinutes(m === 'focus' ? 25 : 5); setSeconds(0); setIsActive(false); }}
            className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
              mode === m ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FocusTimer;
