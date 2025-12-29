
import React, { useState, useMemo } from 'react';
import { UserState, LearningModule } from '../types';

interface Bounty {
  id: string;
  title: string;
  description: string;
  type: 'Daily' | 'Elite' | 'Legendary';
  objective: string;
  payout: { xp: number; credits: number };
  icon: string;
  targetValue: number;
}

interface BountyBoardProps {
  user: UserState;
  modules: LearningModule[];
  claimedIds: string[];
  onClaim: (xp: number, credits: number, bountyId: string) => void;
  isApiEnabled?: boolean;
}

const BountyBoard: React.FC<BountyBoardProps> = ({ user, modules, claimedIds, onClaim, isApiEnabled = true }) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const bounties: Bounty[] = [
    { 
      id: 'b-1', title: 'Layer Synthesis', description: 'Push the limits of neural acquisition by expanding your verified layer count.', 
      type: 'Daily', objective: 'Verified Layers', payout: { xp: 300, credits: 150 }, icon: 'fa-microchip', targetValue: 3
    },
    { 
      id: 'b-2', title: 'Cognitive Perfection', description: 'Verify mastery with absolute precision across multiple knowledge nodes.', 
      type: 'Elite', objective: 'Node Milestones', payout: { xp: 800, credits: 500 }, icon: 'fa-crosshairs', targetValue: 5
    },
    { 
      id: 'b-3', title: 'Deep Concentration', description: 'Maintain a consistent neural link streak for high-density focus.', 
      type: 'Daily', objective: 'Link Streak Days', payout: { xp: 200, credits: 100 }, icon: 'fa-fire', targetValue: 1
    },
    { 
      id: 'b-4', title: 'The Polymath Contract', description: 'Demonstrate domain versatility by initiating multiple distinct knowledge sectors.', 
      type: 'Legendary', objective: 'Active Node Sectors', payout: { xp: 2500, credits: 1500 }, icon: 'fa-globe', targetValue: 3
    }
  ];

  const typeColors = {
    Daily: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Elite: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    Legendary: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  };

  const getBountyProgress = (b: Bounty) => {
    switch (b.id) {
      case 'b-1': return user.lessonsFinished;
      case 'b-2': return user.lessonsFinished;
      case 'b-3': return user.streak;
      case 'b-4': return modules.filter(m => m.progress > 0).length;
      default: return 0;
    }
  };

  const handleClaim = (b: Bounty) => {
    const currentVal = getBountyProgress(b);
    if (syncingId || claimedIds.includes(b.id) || currentVal < b.targetValue) return;
    
    setSyncingId(b.id);
    setTimeout(() => {
      onClaim(b.payout.xp, b.payout.credits, b.id);
      setSyncingId(null);
    }, isApiEnabled ? 1500 : 2500);
  };

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 border rounded-full text-[8px] font-black uppercase tracking-widest font-orbitron ${isApiEnabled ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
               {isApiEnabled ? 'Neural Matrix' : 'Archive Matrix'}
             </span>
             <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-orbitron leading-none">Quest Matrix</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Execute growth contracts to synchronize rewards with your neural profile.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {bounties.map(b => {
          const isSyncing = syncingId === b.id;
          const isClaimed = claimedIds.includes(b.id);
          const currentVal = getBountyProgress(b);
          const isSatisfied = currentVal >= b.targetValue;
          const progressPercent = Math.min(100, (currentVal / b.targetValue) * 100);

          return (
            <div 
              key={b.id} 
              className={`relative p-8 md:p-10 rounded-[3rem] border transition-all duration-500 flex flex-col md:flex-row items-center gap-10 group overflow-hidden
                ${isClaimed 
                  ? 'bg-emerald-950/20 border-emerald-500/20 shadow-none' 
                  : isSatisfied 
                    ? 'bg-blue-900/10 border-blue-500/30 shadow-2xl hover:shadow-blue-500/10' 
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                }
              `}
            >
              <div className={`absolute top-8 right-12 text-[9px] font-black uppercase tracking-[0.3em] font-orbitron 
                ${typeColors[b.type as keyof typeof typeColors].split(' ')[0]}
              `}>
                {b.type} Contract
              </div>

              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2 transition-all duration-700 relative z-10
                 ${isClaimed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : isSatisfied ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-xl' : 'bg-white/5 border-white/10 text-white group-hover:scale-105 group-hover:rotate-3'}
              `}>
                 <i className={`fas ${b.icon} text-4xl`}></i>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                 <div>
                    <h3 className={`text-2xl font-black uppercase tracking-tight font-orbitron leading-tight ${isClaimed ? 'text-slate-500' : 'text-white'}`}>
                      {b.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl mt-1">
                      {b.description}
                    </p>
                 </div>

                 <div className="pt-2 space-y-3 w-full max-w-xl">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isClaimed ? 'text-slate-600' : 'text-slate-400'}`}>
                             {b.objective}: <span className={isSatisfied ? 'text-emerald-500' : 'text-blue-400'}>{currentVal} / {b.targetValue}</span>
                          </span>
                       </div>
                       <span className={`text-[10px] font-black font-orbitron ${isSatisfied ? 'text-emerald-500' : 'text-blue-400'}`}>
                          {Math.round(progressPercent)}%
                       </span>
                    </div>

                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                       <div 
                         className={`h-full transition-all duration-1000 ease-out relative ${
                           isClaimed 
                             ? 'bg-slate-700' 
                             : isSatisfied 
                               ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                               : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                         }`} 
                         style={{ width: `${progressPercent}%` }}
                       >
                          {!isClaimed && <div className="absolute inset-0 shimmer-effect opacity-30"></div>}
                       </div>
                    </div>

                    {isSatisfied && !isClaimed && (
                       <div className="flex items-center gap-2 animate-pulse">
                          <i className="fas fa-check-circle text-emerald-500 text-[10px]"></i>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Requirements Validated</span>
                       </div>
                    )}
                 </div>
              </div>

              <div className="md:w-72 w-full pt-8 md:pt-0 md:pl-10 md:border-l border-white/10 flex flex-col gap-8">
                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleClaim(b)}
                      disabled={isClaimed || isSyncing || !isSatisfied}
                      className={`relative w-full h-16 rounded-full border-2 transition-all duration-500 group/switch overflow-hidden flex items-center ${
                        isClaimed 
                          ? 'bg-emerald-600/10 border-emerald-500/40' 
                          : !isSatisfied
                            ? 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'
                            : isSyncing
                              ? 'bg-blue-900/20 border-blue-500/30'
                              : 'bg-slate-950 border-white/10 hover:border-blue-500/40'
                      }`}
                    >
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          <span className={`text-[8px] font-black uppercase tracking-[0.4em] font-orbitron transition-all duration-700 ${
                            isClaimed 
                              ? 'text-emerald-500 opacity-100 -translate-x-6' 
                              : isSyncing 
                                ? 'text-blue-400 animate-pulse' 
                                : !isSatisfied
                                  ? 'text-slate-700 opacity-40'
                                  : 'text-blue-400 opacity-100 translate-x-6'
                          }`}>
                            {isClaimed ? 'Verified' : isSyncing ? 'Syncing' : !isSatisfied ? 'Locked' : 'Ready'}
                          </span>
                       </div>

                       <div className={`absolute top-1 bottom-1 w-14 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out shadow-2xl z-10 ${
                           isClaimed 
                             ? 'right-1 left-auto bg-emerald-500' 
                             : isSyncing
                               ? 'left-1/2 -translate-x-1/2 bg-blue-500 animate-pulse'
                               : !isSatisfied
                                 ? 'left-1 bg-slate-900'
                                 : 'left-1 bg-slate-800 border border-blue-500/40'
                         }`}>
                          {isClaimed ? (
                            <i className="fas fa-check text-white text-sm"></i>
                          ) : isSyncing ? (
                            <i className="fas fa-circle-notch animate-spin text-white text-sm"></i>
                          ) : !isSatisfied ? (
                            <i className="fas fa-lock text-slate-700 text-sm"></i>
                          ) : (
                            <i className="fas fa-bolt text-blue-400 text-sm animate-bounce"></i>
                          )}
                       </div>
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BountyBoard;
