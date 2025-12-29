
import React, { useState, useMemo } from 'react';
import { SOFTWARE_CATALOG } from '../constants';
import { AppId, ModuleCategory } from '../types';

interface AppManagerProps {
  installedAppIds: AppId[];
  onInstall: (id: AppId) => void;
  onUninstall: (id: AppId) => void;
  onOpen: (id: AppId) => void;
}

const AppManager: React.FC<AppManagerProps> = ({ installedAppIds, onInstall, onUninstall, onOpen }) => {
  const [syncingId, setSyncingId] = useState<AppId | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<ModuleCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const steps = [
    "Establishing Neural Handshake...",
    "Downloading Growth Vectors...",
    "Verifying Cognitive Integrity...",
    "Neural Sync Successful."
  ];

  const handleAction = (id: AppId, isInstalled: boolean) => {
    if (syncingId) return;
    setSyncingId(id);
    setProgress(0);
    setStatus(steps[0]);

    let interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (isInstalled) onUninstall(id);
            else onInstall(id);
            setSyncingId(null);
          }, 500);
          return 100;
        }
        const next = p + 10;
        const stepIdx = Math.floor((next / 100) * steps.length);
        setStatus(steps[Math.min(stepIdx, steps.length - 1)]);
        return next;
      });
    }, 150);
  };

  const filteredApps = useMemo(() => {
    return SOFTWARE_CATALOG.filter(app => {
      const matchesFilter = filter === 'All' || app.category === filter;
      const matchesSearch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight font-orbitron">App Ecosystem</h1>
          <p className="text-slate-500 font-medium">Initialize specialized knowledge nodes and learning tools.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter knowledge tools..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-4 flex items-center text-slate-600 hover:text-slate-300 transition-colors"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', ...Object.values(ModuleCategory)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
              filter === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.map(app => {
            const isInstalled = installedAppIds.includes(app.id);
            const isSyncing = syncingId === app.id;

            return (
              <div key={app.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex flex-col hover:border-white/10 transition-all group animate-in fade-in duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border transition-all ${isInstalled ? 'text-blue-400 border-blue-500/20 shadow-inner' : 'text-slate-600 border-white/5'}`}>
                    <i className={`fas ${app.icon} text-xl group-hover:scale-110 transition-transform`}></i>
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{app.category}</span>
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight font-orbitron">{app.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-8 h-12 overflow-hidden">{app.description}</p>
                
                <div className="mt-auto">
                  {isSyncing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase text-blue-400 animate-pulse">
                        <span>{status}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(app.id, isInstalled)}
                        className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                          isInstalled ? 'bg-white/5 text-red-400 hover:bg-red-400/10' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10'
                        }`}
                      >
                        {isInstalled ? 'Uninstall' : 'Install'}
                      </button>
                      {isInstalled && (
                        <button onClick={() => onOpen(app.id)} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/5 transition-colors">
                          <i className="fas fa-external-link text-xs"></i>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mx-auto text-slate-700">
             <i className="fas fa-search-minus text-2xl"></i>
           </div>
           <div className="space-y-1">
             <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching tools detected</p>
             <p className="text-slate-600 text-[10px] font-medium uppercase tracking-widest">Adjust your filters or try a different neural keyword</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AppManager;
