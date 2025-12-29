
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
    <div className="p-8 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight font-orbitron">Neural Armory</h1>
          <p className="text-slate-500 font-medium">Equip artifacts to optimize your growth dynamics.</p>
        </div>
        <div className="bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
           <i className="fas fa-coins text-amber-500"></i>
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">Neural Credits</p>
             <p className="text-xl font-black text-white font-orbitron">{user.credits}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventory.map(item => (
          <div key={item.id} className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 flex flex-col hover:border-white/10 transition-all group relative overflow-hidden">
            {/* Rarity Flare */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-widest border-b border-l rounded-bl-xl ${rarityColors[item.rarity]}`}>
              {item.rarity}
            </div>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${rarityColors[item.rarity]}`}>
              <i className={`fas ${item.icon} text-2xl`}></i>
            </div>

            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{item.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{item.type}</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 flex-1">{item.description}</p>
            
            <div className="mt-auto space-y-3">
              {item.isOwned ? (
                <button 
                  onClick={() => onEquip(item.id)}
                  className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    item.isEquipped ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {item.isEquipped ? 'Equipped' : 'Equip'}
                </button>
              ) : (
                <button 
                  onClick={() => onBuy(item.id)}
                  disabled={user.credits < item.cost}
                  className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    user.credits >= item.cost ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <i className="fas fa-coins text-[8px]"></i>
                  {item.cost} Credits
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-3xl flex items-center justify-between group">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
               <i className="fas fa-circle-info"></i>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Mastery Bonuses Active</p>
              <p className="text-[10px] text-slate-500 font-medium">Equipped artifacts modify synaptic throughput in real-time.</p>
            </div>
         </div>
         <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">System Optimized</span>
      </div>
    </div>
  );
};

export default Armory;
