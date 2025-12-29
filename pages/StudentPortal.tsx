
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
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Operational Hub: <span className="text-blue-600">Connected</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Active Explorer: {user.name} • Mechdyane OS v9.0</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            {stats.map(s => (
              <div key={s.label} className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[160px]">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-xl font-black text-slate-800 leading-none">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: ACTIVE MISSION CONTROL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrated Nodes</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Neural Sync Active</span>
            </div>

            {enrolledModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledModules.map(module => (
                  <div key={module.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col min-h-[280px]">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center text-white shadow-lg`}>
                        <i className={`fas ${module.icon} text-xl`}></i>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layer {module.lessonsFinished + 1} / 12</p>
                        <p className="text-xl font-black text-blue-600">{module.progress}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{module.title}</h3>
                      <button onClick={() => setViewingModule(module)} className="text-slate-300 hover:text-blue-500 transition-colors mb-2">
                         <i className="fas fa-circle-info text-xs"></i>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-auto leading-relaxed">
                      Next: {module.outline[module.lessonsFinished] || 'Expert Master'}
                    </p>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full my-6 overflow-hidden relative shadow-inner border border-slate-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${module.progress}%` }}
                      >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 shimmer-effect"></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onAccessCourse(module)}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-bolt"></i> {module.lessonsFinished === 0 ? 'Initialize Node' : 'Resume Activation'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Active Neural Streams</p>
                <button className="mt-4 text-blue-600 font-black uppercase text-[10px] tracking-widest">Select a Knowledge Node Below</button>
              </div>
            )}
          </div>

          {/* RIGHT: LEADERBOARD */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Top Explorers</h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 space-y-4">
                {MOCK_LEADERBOARD.map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${entry.isCurrentUser ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{entry.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Lv. {entry.level} • {entry.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] border-t border-slate-100 hover:text-blue-600 transition-colors">
                Global Rankings
              </button>
            </div>
          </div>

        </div>

        {/* CURRICULUM EXPLORER */}
        <section className="space-y-10 pt-10 border-t border-slate-200">
          <header className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
            <div>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Node Repository</h2>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Choose Your Path</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', ...Object.values(ModuleCategory)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveTab(cat as any)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === cat ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredLibrary.map(module => (
              <div key={module.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-6 group flex flex-col relative overflow-hidden">
                <div className={`w-12 h-12 rounded-2xl ${module.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${module.icon}`}></i>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">{module.title}</h4>
                  <button onClick={() => setViewingModule(module)} className="text-slate-300 hover:text-blue-500 transition-colors mb-2">
                    <i className="fas fa-circle-info text-xs"></i>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-widest">{module.category}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 h-12 overflow-hidden">
                  {module.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                  {module.isEnrolled ? (
                    <button 
                      onClick={() => onAccessCourse(module)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
                    >
                      Integrated
                    </button>
                  ) : (
                    <button 
                      onClick={() => onEnroll(module.id)}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-md"
                    >
                      Integrate Node
                    </button>
                  )}
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none">Layers</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase leading-tight">12</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL: COURSE DETAILS */}
      {viewingModule && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingModule(null)}></div>
           <div className="relative w-full max-w-4xl max-h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
              {/* SIDEBAR */}
              <div className={`md:w-1/3 p-10 ${viewingModule.color} text-white flex flex-col`}>
                 <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 mb-8 shadow-xl">
                    <i className={`fas ${viewingModule.icon} text-4xl`}></i>
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">{viewingModule.title}</h2>
                 <p className="text-white/80 text-sm font-medium leading-relaxed mb-auto">
                    {viewingModule.description}
                 </p>
                 <div className="pt-8 mt-8 border-t border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Neural Difficulty</p>
                    <p className="text-xl font-black">{viewingModule.difficulty || 'Scalable Mastery'}</p>
                 </div>
              </div>

              {/* CONTENT */}
              <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar space-y-12">
                 <button onClick={() => setViewingModule(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors">
                    <i className="fas fa-times text-2xl"></i>
                 </button>

                 <section className="space-y-6">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Integrated Objectives</h3>
                    <div className="space-y-4">
                       {viewingModule.objectives.map((obj, i) => (
                         <div key={i} className="flex gap-4">
                            <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{obj}</p>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Synaptic Architecture (12 Layers)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                       {viewingModule.outline.map((step, i) => (
                         <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                               {i + 1}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate">{step}</span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <div className="pt-6">
                    {viewingModule.isEnrolled ? (
                      <button 
                        onClick={() => { onAccessCourse(viewingModule); setViewingModule(null); }}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        Enter Activation Interface
                      </button>
                    ) : (
                      <button 
                        onClick={() => { onEnroll(viewingModule.id); setViewingModule(null); }}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        Initiate Node Integration
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
