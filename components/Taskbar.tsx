
import React, { useState, useEffect, useMemo } from 'react';
import { AppId } from '../types';

interface TaskbarProps {
  windows: any[];
  activeApp: AppId | null;
  onAppClick: (id: AppId) => void;
  onCloseApp: (id: AppId) => void;
  onMinimizeApp: (id: AppId) => void;
  onStartClick: () => void;
  onControlClick: () => void;
  onCalendarClick: () => void;
  isApiEnabled?: boolean;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  windows, 
  activeApp, 
  onAppClick, 
  onCloseApp,
  onMinimizeApp,
  onStartClick, 
  onControlClick, 
  onCalendarClick, 
  isApiEnabled = true 
}) => {
  const [time, setTime] = useState(new Date());
  const [isSpinning, setIsSpinning] = useState(false);
  const [simulatedPing, setSimulatedPing] = useState(24);
  const [neuralLoad, setNeuralLoad] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const metricsTimer = setInterval(() => {
        setSimulatedPing(prev => Math.max(12, Math.min(120, prev + (Math.random() > 0.5 ? 2 : -2))));
        setNeuralLoad(prev => Math.max(5, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);

    return () => {
        clearInterval(timer);
        clearInterval(metricsTimer);
    };
  }, []);

  const handleStartClick = () => {
    setIsSpinning(true);
    onStartClick();
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <div className="h-14 glass border-t border-white/10 flex items-center px-4 z-[9999] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
      <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ${isApiEnabled ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] w-full' : 'bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.8)] w-1/3'}`}></div>

      <button 
        onClick={handleStartClick}
        className={`w-11 h-11 flex items-center justify-center rounded-xl text-white shadow-lg active:scale-90 hover:brightness-110 transition-all duration-200 overflow-hidden relative group ${isApiEnabled ? 'bg-blue-600' : 'bg-amber-600'}`}
        title="Mechdyane Start"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <i className={`fas fa-microchip text-lg ${isSpinning ? 'animate-spin-once' : ''}`}></i>
      </button>
      
      <div className="mx-4 h-8 w-px bg-white/10"></div>
      
      <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {windows.map(win => {
          const isActive = activeApp === win.id;
          return (
            <div key={win.id} className="relative group/item shrink-0">
              <button
                onClick={() => onAppClick(win.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  // Minimize if the app is active, providing the requested "Double Click to Minimize" behavior
                  if (isActive) {
                    onMinimizeApp(win.id);
                  }
                }}
                className={`
                  relative flex items-center gap-3 pl-4 pr-12 h-11 rounded-xl transition-all duration-500 group active:scale-95
                  ${isActive 
                    ? 'bg-white/10 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10' 
                    : 'hover:bg-white/5 border border-transparent'}
                `}
                title={isActive ? "Double-click to Minimize" : `Switch to ${win.title}`}
              >
                <i className={`
                  fas ${win.icon} transition-all duration-500
                  ${isActive 
                    ? (isApiEnabled ? 'text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)] scale-110' : 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-110') 
                    : 'text-slate-500 group-hover:text-slate-300'}
                `}></i>
                
                <span className={`
                  text-[10px] font-black uppercase tracking-widest hidden md:block transition-all duration-500
                  ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                `}>
                  {win.title}
                </span>

                <div className={`
                  absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-700
                  ${isActive ? `w-6 ${isApiEnabled ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,1)]'}` : 'w-0 bg-transparent'}
                `}></div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseApp(win.id);
                }}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center 
                  transition-all duration-200 opacity-0 group-hover/item:opacity-100 hover:bg-red-500 text-white z-10
                  ${isActive ? 'opacity-20' : ''}
                `}
                title="Terminate Process"
              >
                <i className="fas fa-times text-[9px]"></i>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 ml-4">
        <div className="hidden lg:flex items-center gap-5 border-r border-white/5 pr-6">
           <div className="flex flex-col gap-1 items-end min-w-[60px]">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Neural Load</p>
              <div className="flex items-center gap-2">
                 <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${neuralLoad}%` }}
                    ></div>
                 </div>
                 <span className="text-[8px] font-orbitron font-black text-blue-400">{neuralLoad}%</span>
              </div>
           </div>

           <div className="flex flex-col gap-1 items-end">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Latency</p>
              <div className="flex items-center gap-1.5">
                 <i className="fas fa-satellite-dish text-[8px] text-emerald-500 animate-pulse"></i>
                 <span className="text-[8px] font-orbitron font-black text-emerald-400">{simulatedPing}ms</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onControlClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-white/5 active:scale-90
              ${activeApp === 'control-panel' ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-blue-400'}
            `}
            title="Control Center"
          >
            <i className="fas fa-sliders-h text-xs"></i>
          </button>

          <button 
            onClick={onCalendarClick}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all border border-white/5 active:scale-95
                ${activeApp === 'calendar' ? 'bg-white/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'hover:bg-white/5'}
            `}
            title="Temporal Node (Calendar)"
          >
            <div className="text-right flex flex-col justify-center">
              <p className="text-[11px] font-black text-slate-100 font-orbitron leading-none mb-0.5">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
              <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none">
                {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${activeApp === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-500'}
            `}>
                <i className="fas fa-calendar-day text-[11px]"></i>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes dash { to { stroke-dashoffset: -1000; } }
      `}</style>
    </div>
  );
};

export default Taskbar;
