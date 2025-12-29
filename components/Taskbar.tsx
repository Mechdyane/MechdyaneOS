
import React, { useState, useEffect } from 'react';
import { AppId } from '../types';

interface TaskbarProps {
  windows: any[];
  activeApp: AppId | null;
  onAppClick: (id: AppId) => void;
  onCloseApp: (id: AppId) => void;
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
  onStartClick, 
  onControlClick, 
  onCalendarClick, 
  isApiEnabled = true 
}) => {
  const [time, setTime] = useState(new Date());
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartClick = () => {
    setIsSpinning(true);
    onStartClick();
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <div className="h-12 glass border-t border-white/10 flex items-center px-4 z-[9999] shadow-lg">
      <button 
        onClick={handleStartClick}
        className={`w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-lg active:scale-90 hover:brightness-110 transition-all duration-200 overflow-hidden ${isApiEnabled ? 'bg-blue-600' : 'bg-amber-600'}`}
      >
        <i className={`fas fa-microchip ${isSpinning ? 'animate-spin-once' : ''}`}></i>
      </button>
      
      <div className="mx-4 h-6 w-px bg-white/10"></div>
      
      <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {!isApiEnabled && (
           <div className="flex items-center gap-2 px-3 h-8 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-500 animate-pulse shrink-0">
             <i className="fas fa-shield-halved text-[9px]"></i>
             <span className="text-[8px] font-black uppercase tracking-widest hidden lg:block">Archive Mode</span>
           </div>
        )}
        {windows.map(win => {
          const isActive = activeApp === win.id;
          return (
            <div key={win.id} className="relative group/item shrink-0">
              <button
                onClick={() => onAppClick(win.id)}
                className={`
                  relative flex items-center gap-3 pl-4 pr-10 h-10 rounded-xl transition-all duration-300 group active:scale-95
                  ${isActive ? 'bg-white/10 border border-white/10 shadow-inner' : 'hover:bg-white/5'}
                `}
              >
                <i className={`
                  fas ${win.icon} transition-all duration-300
                  ${isActive ? (isApiEnabled ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] scale-110' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110') : 'text-slate-500 group-hover:text-slate-300'}
                `}></i>
                
                <span className={`
                  text-[10px] font-black uppercase tracking-widest hidden md:block transition-all duration-300
                  ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                `}>
                  {win.title}
                </span>

                {/* Active Indicator Line */}
                <div className={`
                  absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-500
                  ${isActive ? `w-4 ${isApiEnabled ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]'}` : 'w-0 bg-transparent'}
                `}></div>
              </button>

              {/* Close Button on Taskbar Item */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseApp(win.id);
                }}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center 
                  transition-all duration-200 opacity-0 group-hover/item:opacity-100 hover:bg-red-500/80 text-slate-400 hover:text-white
                  ${isActive ? 'opacity-40' : ''}
                `}
                title="Terminate Node"
              >
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        {/* OS Status Icons */}
        <div className="flex items-center gap-2 md:gap-3 text-slate-500 mr-2 border-r border-white/5 pr-4 hidden sm:flex">
          <i className={`fas fa-wifi text-[10px] ${isApiEnabled ? 'text-blue-400/60' : 'text-amber-500/60'}`} title={isApiEnabled ? "Neural Link Active" : "Archive Link Active"}></i>
          <i className="fas fa-battery-three-quarters text-[10px]" title="System Energy 75%"></i>
          <button 
            onClick={onControlClick}
            className={`hover:text-blue-400 transition-colors px-1 ${!isApiEnabled ? 'hover:text-amber-400' : ''}`}
          >
            <i className="fas fa-sliders text-[11px]" title="Control Center"></i>
          </button>
        </div>

        {/* Time and Date */}
        <button 
          onClick={onCalendarClick}
          className="text-right hover:bg-white/5 px-2 py-1 rounded-lg transition-all active:scale-95"
        >
          <p className="text-[10px] font-black text-slate-100 font-orbitron leading-none mb-0.5">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </p>
        </button>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Taskbar;
