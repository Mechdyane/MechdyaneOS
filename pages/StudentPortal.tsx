
import React, { useState } from 'react';
import { LearningModule, ModuleCategory, UserState } from '../types';
import { MOCK_LEADERBOARD } from '../constants';

interface StudentPortalProps {
  user: UserState;
  modules: LearningModule[];
  onAccessCourse: (module: LearningModule) => void;
  onEnroll: (moduleId: string) => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ user, modules, onAccessCourse, onEnroll }) => {
  const [activeTab, setActiveTab] = useState<ModuleCategory | 'ALL'>('ALL');
  const [viewingModule, setViewingModule] = useState<LearningModule | null>(null);
  
  const enrolledModules = modules.filter(m => m.isEnrolled);
  const filteredLibrary = activeTab === 'ALL' 
    ? modules 
    : modules.filter(m => m.category === activeTab);

  const stats = [
    { label: 'Neural Streak', value: `${user.streak} Days`, icon: 'fa-fire', color: 'text-orange-500' },
    { label: 'Growth Level', value: `Lv. ${user.level}`, icon: 'fa-medal', color: 'text-blue-500' },
    { label: 'Neural Credits', value: user.credits, icon: 'fa-coins', color: 'text-amber-500' },
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden text-slate-900">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-12 pb-32">
        
        {/* HEADER / QUICK STATS */}
        <section className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 font-orbitron uppercase">
              Operational Hub: <span className="text-blue-600">Connected</span>
            </h1>
            <p className="text-slate-500 font-bold mt-1 text-[10px] uppercase tracking-[0.3em]">Active Explorer: {user.name} • Mechdyane OS v9.0</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            {stats.map(s => (
              <div key={s.label} className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[160px]">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-xl font-black text-slate-800 leading-none font-orbitron">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: ACTIVE MISSION CONTROL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] font-orbitron">Integrated Nodes</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse font-orbitron">Neural Sync Active</span>
            </div>

            {enrolledModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledModules.map(module => (
                  <div key={module.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <i className={`fas ${module.icon} text-xl`}></i>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-orbitron">Layer {module.lessonsFinished + 1} / 12</p>
                        <p className="text-2xl font-black text-blue-600 font-orbitron">{module.progress}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 font-orbitron">{module.title}</h3>
                      <button onClick={() => setViewingModule(module)} className="text-slate-300 hover:text-blue-500 transition-colors mb-2">
                         <i className="fas fa-circle-info text-xs"></i>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-auto leading-relaxed">
                      Executing: <span className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">{module.outline[module.lessonsFinished] || 'Expert Master'}</span>
                    </p>
                    
                    <div className="h-2 w-full bg-slate-100 rounded-full my-6 overflow-hidden relative shadow-inner border border-slate-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${module.progress}%` }}
                      >
                        <div className="absolute inset-0 shimmer-effect"></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onAccessCourse(module)}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 font-orbitron"
                    >
                      <i className="fas fa-bolt"></i> {module.lessonsFinished === 0 ? 'Initialize Node' : 'Resume Stream'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-300">
                <i className="fas fa-satellite-dish text-4xl text-slate-200 mb-4 block"></i>
                <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em] font-orbitron">No Active Neural Streams</p>
                <button className="mt-4 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline">Choose a node from repository</button>
              </div>
            )}
          </div>

          {/* RIGHT: LEADERBOARD */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 font-orbitron">Top Explorers</h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 space-y-4">
                {MOCK_LEADERBOARD.map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${entry.isCurrentUser ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black font-orbitron ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight font-orbitron">{entry.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lv. {entry.level} • {entry.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-5 bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] border-t border-slate-100 hover:text-blue-600 transition-colors font-orbitron">
                Global Rankings
              </button>
            </div>
          </div>

        </div>

        {/* CURRICULUM EXPLORER */}
        <section className="space-y-10 pt-10 border-t border-slate-200">
          <header className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
            <div>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 font-orbitron">Node Repository</h2>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter font-orbitron uppercase">Global Library</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', ...Object.values(ModuleCategory)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveTab(cat as any)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border font-orbitron ${activeTab === cat ? 'bg-slate-800 border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredLibrary.map(module => (
              <div key={module.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 group flex flex-col relative overflow-hidden">
                <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${module.icon} text-xl`}></i>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 font-orbitron leading-tight">{module.title}</h4>
                  <button onClick={() => setViewingModule(module)} className="text-slate-300 hover:text-blue-500 transition-colors mb-2">
                    <i className="fas fa-circle-info text-sm"></i>
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-black uppercase mb-4 tracking-widest font-orbitron">{module.category}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 h-12 overflow-hidden">
                  {module.description}
                </p>
                
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
                  {module.isEnrolled ? (
                    <button 
                      onClick={() => onAccessCourse(module)}
                      className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all font-orbitron"
                    >
                      INTEGRATED
                    </button>
                  ) : (
                    <button 
                      onClick={() => onEnroll(module.id)}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 font-orbitron"
                    >
                      LINK NODE
                    </button>
                  )}
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none font-orbitron">Layers</p>
                    <p className="text-xs font-black text-slate-500 uppercase leading-tight font-orbitron">12</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL: COURSE DETAILS (Enhanced Futuristic Version) */}
      {viewingModule && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={() => setViewingModule(null)}></div>
           <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border-2 border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
              <div className="absolute inset-0 os-grid opacity-[0.03] pointer-events-none"></div>
              
              {/* MODAL SIDEBAR */}
              <div className={`md:w-80 p-12 ${viewingModule.color} text-white flex flex-col relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <i className={`fas ${viewingModule.icon} text-[200px]`}></i>
                 </div>
                 
                 <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 mb-10 shadow-2xl">
                       <i className={`fas ${viewingModule.icon} text-4xl`}></i>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none font-orbitron">{viewingModule.title}</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-6 font-orbitron">Module Specification</p>
                    <p className="text-white/80 text-sm font-medium leading-relaxed mb-auto">
                       {viewingModule.description}
                    </p>
                    <div className="pt-10 mt-10 border-t border-white/20">
                       <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-2 font-orbitron">Neural Complexity</p>
                       <p className="text-2xl font-black font-orbitron">{viewingModule.difficulty || 'Heuristic'}</p>
                    </div>
                 </div>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar space-y-16 bg-[#0a0f1e]/95 relative">
                 <button onClick={() => setViewingModule(null)} className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                    <i className="fas fa-times text-xl"></i>
                 </button>

                 <section className="space-y-8">
                    <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em] font-orbitron flex items-center gap-3">
                       <i className="fas fa-bullseye text-[10px]"></i> Synaptic Objectives
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       {viewingModule.objectives.map((obj, i) => (
                         <div key={i} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                               <i className="fas fa-check text-blue-500 text-xs"></i>
                            </div>
                            <p className="text-base text-slate-300 font-medium leading-relaxed">{obj}</p>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-8">
                    <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em] font-orbitron flex items-center gap-3">
                       <i className="fas fa-layer-group text-[10px]"></i> Curriculum Architecture
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {viewingModule.outline.map((step, i) => (
                         <div key={i} className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 flex items-center gap-5 group hover:bg-white/[0.06] hover:border-white/10 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all font-orbitron">
                               {(i + 1).toString().padStart(2, '0')}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate font-orbitron group-hover:text-white transition-colors">{step}</span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <div className="pt-10">
                    {viewingModule.isEnrolled ? (
                      <button 
                        onClick={() => { onAccessCourse(viewingModule); setViewingModule(null); }}
                        className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] text-[12px] uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 font-orbitron flex items-center justify-center gap-4"
                      >
                        <i className="fas fa-bolt animate-pulse"></i> Enter Integrated Link
                      </button>
                    ) : (
                      <button 
                        onClick={() => { onEnroll(viewingModule.id); setViewingModule(null); }}
                        className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] text-[12px] uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 font-orbitron flex items-center justify-center gap-4"
                      >
                        <i className="fas fa-plus-circle"></i> Initiate Neural Integration
                      </button>
                    )}
                    <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.5em] mt-8">Secure End-to-End Neural Session Protocol</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
