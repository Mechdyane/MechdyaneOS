
import React from 'react';
import { AppId, UserState } from '../types';

interface SidebarProps {
  onLaunch: (id: AppId) => void;
  user: UserState;
  activeApp: AppId | null;
  isHidden?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLaunch, user, activeApp, isHidden = false }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'appmanager', icon: 'fa-cubes', label: 'Ecosystem' },
    { id: 'assistant', icon: 'fa-robot', label: 'Core AI' },
    { id: 'journal', icon: 'fa-heart-pulse', label: 'Emotions' },
    { id: 'profile', icon: 'fa-user-circle', label: 'Profile' },
    { id: 'armory', icon: 'fa-shield-halved', label: 'Armory' },
  ];

  return (
    <aside 
      className={`
        hidden md:flex w-64 glass h-screen sticky top-0 flex-col items-center py-6 border-r border-white/5 z-[10001] shrink-0 transition-all duration-700 ease-in-out transform
        ${isHidden ? '-translate-x-full opacity-0 pointer-events-none -ml-64' : 'translate-x-0 opacity-100 ml-0'}
      `}
    >
      <div className="flex items-center gap-3 mb-10 px-4 cursor-pointer group/logo" onClick={() => onLaunch('os-helper')}>
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-1000
          ${isHidden 
            ? 'bg-gradient-to-tr from-red-600 to-amber-600 shadow-red-500/20' 
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 glow-blue shadow-blue-500/20'}
        `}>
          <i className={`fas fa-microchip text-xl text-white transition-transform group-hover/logo:rotate-180 duration-700`}></i>
        </div>
        <div className="hidden md:block">
            <span className="font-orbitron text-sm font-black text-white tracking-widest block leading-none">
            MECHDYANE
            </span>
            <span className={`text-[7px] font-black uppercase tracking-[0.3em] mt-1 block transition-colors duration-1000 ${isHidden ? 'text-red-400' : 'text-blue-400'}`}>
              {isHidden ? 'Yield Status: Idle' : 'OS v9.1 Core'}
            </span>
        </div>
      </div>

      <nav className="flex-1 w-full px-2 md:px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onLaunch(item.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-inner' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent'}
              `}
              title={item.label}
            >
              <i className={`fas ${item.icon} text-lg w-6 text-center group-hover:scale-110 transition-transform ${isActive ? 'text-blue-400' : ''}`}></i>
              <span className="hidden md:block font-orbitron text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 w-full space-y-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hidden md:block group hover:border-orange-500/20 transition-all">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
              <i className="fas fa-fire text-orange-500 text-xs"></i>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Neural Streak</p>
              <p className="text-xs font-orbitron text-slate-200 font-black">{user.streak} DAYS</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <button 
                onClick={() => onLaunch('settings')}
                className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-200 transition-colors group"
            >
                <i className="fas fa-cog text-base group-hover:rotate-90 transition-transform duration-500"></i>
                <span className="hidden md:block text-[9px] font-black uppercase tracking-widest">Settings</span>
            </button>
            <button 
                onClick={() => { if(confirm("Terminate link with core?")) window.location.reload(); }}
                className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl text-slate-600 hover:text-red-400 transition-colors group"
            >
                <i className="fas fa-power-off text-base"></i>
                <span className="hidden md:block text-[9px] font-black uppercase tracking-widest">Sign Out</span>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
