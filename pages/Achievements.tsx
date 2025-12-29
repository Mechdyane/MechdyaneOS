
import React from 'react';
import { Achievement, UserState, LearningModule } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
  user: UserState;
  modules: LearningModule[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements, user, modules }) => {
  const rarityColors = {
    Common: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    Rare: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Legendary: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    Artifact: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-orbitron leading-none">Trophy Room</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Live visualization of your neural growth milestones.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.4em] mb-1 font-orbitron">Neural Completion</p>
             <p className="text-4xl font-black text-blue-400 font-orbitron leading-none">{completionPercentage}%</p>
           </div>
           <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-2xl relative">
              <i className="fas fa-award text-blue-400 text-2xl"></i>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {achievements.map(a => {
          const isUnlocked = a.isUnlocked;
          const rarityClass = rarityColors[a.rarity as keyof typeof rarityColors];
          
          return (
            <div 
              key={a.id} 
              className={`relative p-10 rounded-[3rem] border transition-all duration-500 flex items-center gap-10 group overflow-hidden
                ${isUnlocked 
                  ? 'bg-slate-900/60 border-white/10 shadow-2xl hover:border-blue-500/30' 
                  : 'bg-slate-950/40 border-white/5 opacity-80'
                }
              `}
            >
              <div className={`absolute top-8 right-10 text-[9px] font-black uppercase tracking-[0.3em] font-orbitron opacity-40 group-hover:opacity-100`}>
                {a.rarity}
              </div>

              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 transition-all duration-700 relative z-10 
                ${isUnlocked ? 'bg-white/[0.03] border-2 border-emerald-500/30 text-white' : 'bg-slate-900/80 border border-slate-800 text-slate-700'}
              `}>
                <i className={`fas ${a.icon} text-4xl`}></i>
              </div>
              
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className={`text-2xl font-black uppercase tracking-tighter font-orbitron leading-tight transition-colors
                    ${isUnlocked ? 'text-white' : 'text-slate-600'}
                  `}>
                    {a.title}
                  </h3>
                </div>
                
                <p className={`text-sm leading-relaxed font-medium 
                  ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}
                `}>
                  {a.description}
                </p>
                
                {!isUnlocked && (
                  <div className="pt-6 space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 font-orbitron">Progress</span>
                        <span className="text-[10px] font-black text-slate-600 font-orbitron">{a.progress} / {a.target}</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-slate-700 transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }}
                        ></div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
