
import React, { useState, useMemo } from 'react';
import { AppId } from '../types';
import { SOFTWARE_CATALOG } from '../constants';

interface StartMenuProps {
  installedAppIds: AppId[];
  onClose: () => void;
  onLaunch: (id: AppId) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ installedAppIds, onClose, onLaunch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allInstalledApps = useMemo(() => 
    SOFTWARE_CATALOG.filter(a => installedAppIds.includes(a.id)),
    [installedAppIds]
  );

  const filteredApps = useMemo(() => 
    allInstalledApps.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allInstalledApps, searchQuery]
  );

  const handleRecClick = (appId: AppId) => {
    onLaunch(appId);
    onClose();
  };

  return (
    <div 
      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] md:w-[500px] glass rounded-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] z-[10000] animate-mech-start animate-glow-cycle max-h-[80vh] flex flex-col"
      onMouseLeave={() => { if(window.innerWidth >= 768) onClose(); }}
    >
      <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
              <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em] font-orbitron leading-none">MechdyaneOS</h2>
            </div>
            <span className="text-[7px] text-slate-600 font-black uppercase tracking-[0.4em] mt-1 ml-5">Operational Core v9.1</span>
          </div>
          <button 
            onClick={() => onLaunch('appmanager')}
            className="text-[8px] font-black bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 transition-all uppercase tracking-widest"
          >
            App Hub
          </button>
        </div>

        {/* Start Menu Search Bar */}
        <div className="mb-5 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <i className={`fas fa-search text-[10px] transition-colors ${searchQuery ? 'text-blue-400' : 'text-slate-600'}`}></i>
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] font-medium text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-slate-600 hover:text-slate-300 transition-colors"
            >
              <i className="fas fa-times-circle text-[10px]"></i>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => onLaunch(app.id)}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/5 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                  <i className={`fas ${app.icon} text-base text-blue-400 group-hover:text-white`}></i>
                </div>
                <span className="text-[7px] font-bold text-slate-500 group-hover:text-white truncate w-full text-center tracking-tighter uppercase">{app.name}</span>
              </button>
            ))
          ) : (
            <div className="col-span-full py-6 text-center">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No matching nodes</p>
            </div>
          )}
        </div>

        {searchQuery === '' && (
          <div className="mt-8 border-t border-white/5 pt-5">
            <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-1 opacity-60">Recommendations</h2>
            <div className="grid grid-cols-1 gap-2">
              {[
                { title: 'Neural Pathways', time: '5M AGO', icon: 'fa-brain', id: 'neural-stream' },
                { title: 'Strategic Comms', time: '2H AGO', icon: 'fa-comment', id: 'assistant' }
              ].map((rec, i) => (
                <button 
                  key={i} 
                  onClick={() => handleRecClick(rec.id)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 group transition-all text-left w-full active:scale-[0.98]"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:border-blue-500/30 shrink-0 transition-all group-hover:scale-105 shadow-sm">
                    <i className={`fas ${rec.icon} text-base text-blue-400`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate leading-tight">{rec.title}</p>
                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none mt-1 group-hover:text-slate-400">{rec.time}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 border-t border-white/5 p-4 flex items-center justify-between rounded-b-3xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <i className="fas fa-user text-[10px] text-white"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">Explorer_082</p>
            <p className="text-[7px] font-bold text-blue-400 uppercase tracking-tighter mt-1">Growth Status: Active</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => onLaunch('settings')}
            className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
          >
            <i className="fas fa-cog text-xs"></i>
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <i className="fas fa-power-off text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
