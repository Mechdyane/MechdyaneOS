
import React, { useState } from 'react';
import { UserState } from '../types';

interface Bounty {
  id: string;
  title: string;
  description: string;
  type: 'Daily' | 'Elite' | 'Legendary';
  objective: string;
  payout: { xp: number; credits: number };
  icon: string;
  isClaimed: boolean;
  status: 'Available' | 'Active' | 'Completed';
}

interface BountyBoardProps {
  user: UserState;
  onClaim: (xp: number, credits: number, bountyId: string) => void;
}

const BountyBoard: React.FC<BountyBoardProps> = ({ user, onClaim }) => {
  const [bounties, setBounties] = useState<Bounty[]>([
    { 
      id: 'b-1', title: 'Layer Synthesis', description: 'Push the limits of neural acquisition by completing three layers in a single session.', 
      type: 'Daily', objective: 'Complete 3 Lesson Layers', payout: { xp: 300, credits: 150 }, icon: 'fa-microchip', isClaimed: false, status: 'Available' 
    },
    { 
      id: 'b-2', title: 'Cognitive Perfection', description: 'Verify mastery with absolute precision. No synaptic errors permitted.', 
      type: 'Elite', objective: 'Achieve 100% Score on any Quiz', payout: { xp: 800, credits: 500 }, icon: 'fa-crosshairs', isClaimed: false, status: 'Available' 
    },
    { 
      id: 'b-3', title: 'Deep Concentration', description: 'Engage the focus protocol and maintain mental clarity for an extended duration.', 
      type: 'Daily', objective: 'Complete 1 Focus Timer (25m)', payout: { xp: 200, credits: 100 }, icon: 'fa-clock', isClaimed: false, status: 'Available' 
    },
    { 
      id: 'b-4', title: 'The Polymath Contract', description: 'Demonstrate domain versatility across the entire Mechdyane ecosystem.', 
      type: 'Legendary', objective: 'Start 3 different Node Categories', payout: { xp: 2500, credits: 1500 }, icon: 'fa-globe', isClaimed: false, status: 'Available' 
    }
  ]);

  const typeColors = {
    Daily: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Elite: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    Legendary: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  };

  const handleClaim = (b: Bounty) => {
    onClaim(b.payout.xp, b.payout.credits, b.id);
    setBounties(prev => prev.map(item => item.id === b.id ? { ...item, isClaimed: true, status: 'Completed' } : item));
  };

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Live Feed</span>
             <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-orbitron leading-none">Quest Matrix</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">High-priority growth contracts transmitted from the Mechdyane Core.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 font-orbitron">Current Standing</p>
             <p className="text-2xl font-black text-white font-orbitron leading-none">LV. {user.level}</p>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <i className="fas fa-satellite-dish"></i>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {bounties.map(b => (
          <div 
            key={b.id} 
            className={`relative p-8 md:p-10 rounded-[3rem] border transition-all duration-500 flex flex-col md:flex-row items-center gap-10 group overflow-hidden
              ${b.isClaimed 
                ? 'bg-emerald-950/20 border-emerald-500/20 opacity-60' 
                : 'bg-slate-900/60 border-white/5 hover:border-blue-500/30 shadow-2xl hover:shadow-blue-500/10'
              }
            `}
          >
            {/* Rarity/Type Label */}
            <div className={`absolute top-8 right-12 text-[9px] font-black uppercase tracking-[0.3em] font-orbitron 
              ${typeColors[b.type as keyof typeof typeColors].split(' ')[0]}
            `}>
              {b.type} Contract
            </div>

            {/* Icon */}
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2 transition-all duration-700 relative z-10
               ${b.isClaimed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/10 text-white group-hover:scale-105 group-hover:rotate-3'}
            `}>
               <i className={`fas ${b.icon} text-4xl`}></i>
               {!b.isClaimed && <div className="absolute inset-0 bg-current opacity-10 blur-xl"></div>}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 text-center md:text-left">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight font-orbitron leading-tight">
                 {b.title}
               </h3>
               <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                 {b.description}
               </p>
               <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                     <i className="fas fa-bullseye text-blue-400 text-[10px]"></i>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{b.objective}</span>
                  </div>
               </div>
            </div>

            {/* Payout & Action */}
            <div className="md:w-64 w-full pt-8 md:pt-0 md:pl-10 md:border-l border-white/10 flex flex-col gap-6">
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center md:text-left">Payout Vectors</p>
                  <div className="flex justify-center md:justify-start gap-4">
                     <div className="text-center md:text-left">
                        <p className="text-xl font-black text-blue-400 font-orbitron">+{b.payout.xp}</p>
                        <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">XP Sync</p>
                     </div>
                     <div className="text-center md:text-left">
                        <p className="text-xl font-black text-amber-500 font-orbitron">+{b.payout.credits}</p>
                        <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Credits</p>
                     </div>
                  </div>
               </div>
               
               <button 
                 disabled={b.isClaimed}
                 onClick={() => handleClaim(b)}
                 className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all font-orbitron shadow-xl flex items-center justify-center gap-3
                   ${b.isClaimed 
                     ? 'bg-emerald-600/20 text-emerald-400 cursor-default border border-emerald-500/20' 
                     : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95 group/btn'
                   }
                 `}
               >
                 {b.isClaimed ? (
                   <>
                     <i className="fas fa-check-circle"></i>
                     Synced
                   </>
                 ) : (
                   <>
                     <i className="fas fa-bolt animate-pulse"></i>
                     Neural Sync
                   </>
                 )}
               </button>
            </div>

            {/* Background Texture */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
               <i className={`fas ${b.icon} text-[200px]`}></i>
            </div>
          </div>
        ))}
      </div>
      
      <footer className="pt-24 text-center opacity-20">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[1em] font-orbitron leading-none mb-4">Contract Feed v4.2</p>
         <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Bounties refresh in 14:22:09</p>
      </footer>
    </div>
  );
};

export default BountyBoard;
