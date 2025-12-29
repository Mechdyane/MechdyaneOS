
import React from 'react';
import { InventoryItem, UserState } from '../types';

interface ArmoryProps {
  user: UserState;
  inventory: InventoryItem[];
  onBuy: (itemId: string) => void;
  onEquip: (itemId: string) => void;
}

const Armory: React.FC<ArmoryProps> = ({ user, inventory, onBuy, onEquip }) => {
  const rarityColors = {
    Common: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    Rare: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Epic: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    Legendary: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  };

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-orbitron leading-none">Neural Armory</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Equip artifacts to optimize your growth dynamics.</p>
        </div>
        
        <div className="bg-[#0f172a]/80 border border-white/5 px-8 py-5 rounded-3xl flex items-center gap-6 shadow-2xl backdrop-blur-xl group">
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg group-hover:scale-110 transition-transform">
              <i className="fas fa-coins text-amber-500 text-xl"></i>
           </div>
           <div className="text-right flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 font-orbitron leading-none">Neural Credits</p>
             <p className="text-4xl font-black text-white font-orbitron leading-none">{user.credits.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {inventory.map(item => {
          const rarityClass = rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.Common;
          const canAfford = user.credits >= item.cost;
          
          return (
            <div key={item.id} className="bg-slate-900/60 p-8 md:p-10 rounded-[2.5rem] border border-white/5 flex flex-col hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl">
              {/* Rarity Label - Matching the reference image positioning */}
              <div className="absolute top-8 right-10 text-[9px] font-black uppercase tracking-[0.3em] font-orbitron opacity-40 group-hover:opacity-100 transition-opacity">
                {item.rarity}
              </div>

              {/* Icon Container */}
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8 bg-slate-800/80 border transition-all duration-500 group-hover:scale-105 ${item.isEquipped ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
                <i className={`fas ${item.icon} text-3xl ${item.isOwned ? 'text-white' : 'text-slate-600'}`}></i>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter font-orbitron leading-tight">{item.name}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-6 font-orbitron">{item.type}</p>
              
              <p className="text-sm text-slate-400 leading-relaxed mb-10 flex-1 font-medium">
                {item.description}
              </p>
              
              <div className="mt-auto">
                {item.isOwned ? (
                  <button 
                    onClick={() => onEquip(item.id)}
                    className={`w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all font-orbitron shadow-xl ${
                      item.isEquipped 
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {item.isEquipped ? 'EQUIPPED' : 'EQUIP'}
                  </button>
                ) : (
                  <button 
                    onClick={() => onBuy(item.id)}
                    disabled={!canAfford}
                    className={`w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 font-orbitron shadow-xl ${
                      canAfford 
                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20 active:scale-95' 
                        : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <i className="fas fa-coins text-[10px]"></i>
                    {item.cost} CREDITS
                  </button>
                )}
              </div>

              {/* Background Accent */}
              <div className="absolute -bottom-8 -right-8 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                 <i className={`fas ${item.icon} text-[150px]`}></i>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Informational Footer Section */}
      <div className="bg-[#0f172a]/80 border border-blue-500/20 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between group shadow-2xl backdrop-blur-xl">
         <div className="flex items-center gap-8 text-center md:text-left mb-8 md:mb-0">
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:rotate-12 transition-transform duration-500 shrink-0">
               <i className="fas fa-info-circle text-2xl"></i>
            </div>
            <div>
              <p className="text-lg font-black text-white uppercase tracking-widest font-orbitron mb-1">Mastery Bonuses Active</p>
              <p className="text-sm text-slate-500 font-medium">Equipped artifacts modify synaptic throughput and growth vectors in real-time.</p>
            </div>
         </div>
         <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] bg-blue-400/5 px-8 py-4 rounded-full border border-blue-400/20 font-orbitron group-hover:bg-blue-400/10 transition-colors">
            System Optimized
         </span>
      </div>
    </div>
  );
};

export default Armory;
