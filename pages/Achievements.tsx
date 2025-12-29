
import React from 'react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const rarityColors = {
    Common: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    Rare: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Legendary: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    Artifact: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="p-8 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight font-orbitron">Trophy Room</h1>
          <p className="text-slate-500 font-medium">Visualization of your neural milestones and growth markers.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Completion</p>
             <p className="text-xl font-black text-blue-400 font-orbitron">{Math.round((unlockedCount/achievements.length)*100)}%</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
              <i className="fas fa-award text-blue-400"></i>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map(a => (
          <div key={a.id} className={`p-8 rounded-[2.5rem] border transition-all flex items-center gap-8 group ${
            a.isUnlocked 
              ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' 
              : 'bg-slate-900/40 border-white/5 opacity-60'
          }`}>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 border-2 ${
              a.isUnlocked ? rarityColors[a.rarity] : 'bg-slate-800 text-slate-600 border-slate-700'
            }`}>
              <i className={`fas ${a.icon} text-3xl`}></i>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black uppercase tracking-tighter font-orbitron ${a.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  {a.title}
                </h3>
                <span className={`text-[9px] font-black uppercase tracking-widest ${a.isUnlocked ? rarityColors[a.rarity] : 'text-slate-700'}`}>
                  {a.rarity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{a.description}</p>
              
              {!a.isUnlocked && (
                <div className="pt-4 space-y-2">
                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
                      <span>Neural Link Progress</span>
                      <span>{a.progress} / {a.target}</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600 transition-all" style={{ width: `${(a.progress/a.target)*100}%` }}></div>
                   </div>
                </div>
              )}
            </div>
            
            {a.isUnlocked && (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-in fade-in scale-in duration-700">
                <i className="fas fa-check-circle text-sm"></i>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
