
import React, { useState } from 'react';
import { ModuleCategory, LearningModule } from '../types';

interface ModulesProps {
  onAccess?: (module: LearningModule) => void;
  onEnroll?: (moduleId: string) => void;
  modules?: LearningModule[];
}

const Modules: React.FC<ModulesProps> = ({ onAccess, onEnroll, modules = [] }) => {
  const [filter, setFilter] = useState<ModuleCategory | 'All'>('All');

  const filteredModules = filter === 'All' 
    ? modules 
    : modules.filter(m => m.category === filter);

  return (
    <div className="p-4 md:p-10 h-full overflow-y-auto bg-slate-50 pb-24 text-slate-900 custom-scrollbar">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Knowledge Ecosystem</h1>
        <p className="text-slate-500 font-medium">Initialize specialized neural paths for academic, vocational, and behavioral growth.</p>
      </header>
      
      <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
        {['All', ...Object.values(ModuleCategory)].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm whitespace-nowrap ${
              filter === cat 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredModules.map((module) => (
          <div 
            key={module.id} 
            className={`group rounded-[2.5rem] p-10 transition-all hover:shadow-2xl flex flex-col min-h-[380px] relative overflow-hidden ${module.color || 'bg-slate-800'}`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <i className={`fas ${module.icon} text-[140px]`}></i>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <i className={`fas ${module.icon} text-3xl text-white`}></i>
                </div>
                {module.isEnrolled && (
                   <span className="px-4 py-1.5 bg-white/20 text-white text-[9px] font-black rounded-full border border-white/30 uppercase tracking-widest">Active</span>
                )}
              </div>
              
              <h3 className="text-3xl font-black text-white mb-4 leading-tight tracking-tight uppercase">{module.title}</h3>
              <p className="text-white/80 font-medium text-sm leading-relaxed mb-auto max-w-[85%]">
                {module.description}
              </p>
              
              <div className="mt-10 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                      {module.difficulty} • {module.totalLessons} LESSONS
                    </span>
                 </div>
                 
                 {module.isEnrolled ? (
                    <button 
                      onClick={() => onAccess?.(module)}
                      className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-play"></i> Open Neural Path
                    </button>
                 ) : (
                    <button 
                      onClick={() => onEnroll?.(module.id)}
                      className="w-full py-4 bg-slate-900/40 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl border border-white/10 transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-plus"></i> Initialize Node
                    </button>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
