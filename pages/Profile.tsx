
import React, { useState, useRef } from 'react';
import { UserState, LearningModule, Achievement, InventoryItem, ModuleCategory } from '../types';

interface ProfileProps {
  user: UserState;
  modules: LearningModule[];
  achievements: Achievement[];
  inventory: InventoryItem[];
  onUpdateUser: (updates: Partial<UserState>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, modules, achievements, inventory, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    institution: user.institution || '',
    specialization: user.specialization || '',
    bio: user.bio || ''
  });
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const equippedItems = inventory.filter(i => i.isEquipped);
  const totalUnlocked = achievements.filter(a => a.isUnlocked).length;
  
  const rarityMap = {
    Common: 'bg-slate-400/10 border-slate-400/20 text-slate-400',
    Rare: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    Epic: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
    Legendary: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  };

  const getProgress = (category: ModuleCategory) => {
    const domainModules = modules.filter(m => m.category === category);
    if (domainModules.length === 0) return 0;
    const total = domainModules.reduce((acc, m) => acc + m.progress, 0);
    return Math.round(total / domainModules.length);
  };

  // Fixed mapping of non-existent ModuleCategory properties to correct ones
  const academicProgress = getProgress(ModuleCategory.EDUCATION);
  const behaviorProgress = getProgress(ModuleCategory.BEHAVIOR_GAMIFICATION);
  const vocationalProgress = getProgress(ModuleCategory.ENGINEERING_TECH);

  const handleSave = () => {
    onUpdateUser({ ...formData });
    setIsEditing(false);
  };

  const triggerIdentitySync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const progressInLevel = user.xp % 1000;
  const xpPercentage = Math.min(100, (progressInLevel / 1000) * 100);

  return (
    <div className="p-10 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Neural ID Card */}
      <div className="relative overflow-hidden glass rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-12">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <i className="fas fa-fingerprint text-[240px] text-blue-400"></i>
        </div>

        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-blue-600/30 p-2 shadow-[0_0_60px_rgba(37,99,235,0.15)] group-hover:scale-105 transition-transform duration-500 relative">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl text-blue-400 border border-white/10 overflow-hidden relative">
               {user.avatar ? (
                 <img src={user.avatar} className="w-full h-full object-cover" alt="User Avatar" />
               ) : (
                 <i className="fas fa-user-ninja"></i>
               )}
               {syncing && (
                 <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                   <i className="fas fa-satellite-dish text-white animate-spin"></i>
                 </div>
               )}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="fas fa-camera text-white text-2xl"></i>
               </div>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest border-4 border-[#020617] shadow-lg font-orbitron">
             Rank {user.level}
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left z-10">
           <div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Explorer Identity</p>
                <button 
                  onClick={triggerIdentitySync}
                  className={`w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] hover:bg-blue-600 hover:text-white transition-all ${syncing ? 'animate-spin' : ''}`}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tighter leading-none mb-2">
                {user.name}
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {user.specialization || 'General Explorer'} • {user.institution || 'Mechdyane Central'}
              </p>
           </div>

           <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 font-orbitron">
                <i className="fas fa-coins text-amber-500"></i> {user.credits} CRD
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
              >
                <i className="fas fa-pen"></i> Sync Profile Details
              </button>
           </div>

           <div className="space-y-2 max-w-md mx-auto md:mx-0">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Threshold Progress</p>
                <span className="text-[10px] font-black text-blue-400 font-orbitron">{progressInLevel} / 1000 XP</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${xpPercentage}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {isEditing && (
        <div className="glass rounded-[2.5rem] p-10 border border-blue-500/30 animate-in zoom-in-95 duration-300">
           <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 font-orbitron">Identity Parameters Override</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Explorer Alias</label>
                   <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-all font-orbitron"
                   />
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Synaptic Specialization</label>
                   <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-all font-orbitron"
                   />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Neural Institution</label>
                   <input 
                    type="text" 
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-all font-orbitron"
                   />
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Identity Bio</label>
                   <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-all h-[106px] resize-none"
                   />
                </div>
              </div>
           </div>
           <div className="flex gap-4 mt-10">
              <div className="flex-1">
                <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all">Execute Sync</button>
              </div>
              <button onClick={() => setIsEditing(false)} className="px-10 py-4 bg-white/5 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest border border-white/5 hover:text-white transition-all">Abort</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
           <section className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                 <i className="fas fa-chart-simple text-blue-400"></i> Domain Mastery Analysis
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                   { label: 'Academic mastery', val: academicProgress, color: 'from-blue-600 to-blue-400', glow: 'shadow-blue-500/20', icon: 'fa-graduation-cap' },
                   { label: 'Skill Vectors', val: vocationalProgress, color: 'from-emerald-600 to-emerald-400', glow: 'shadow-emerald-500/20', icon: 'fa-tools' },
                   { label: 'Behavioral Sync', val: behaviorProgress, color: 'from-violet-600 to-violet-400', glow: 'shadow-violet-500/20', icon: 'fa-brain' },
                 ].map(domain => (
                   <div key={domain.label} className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-white/10 transition-colors">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg bg-gradient-to-br ${domain.color} ${domain.glow} neural-pulse-bg`}>
                         <i className={`fas ${domain.icon}`}></i>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{domain.label}</p>
                         <p className="text-3xl font-black text-white font-orbitron">{domain.val}%</p>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className={`h-full bg-gradient-to-r ${domain.color}`} style={{ width: `${domain.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                 <i className="fas fa-clock-rotate-left text-purple-400"></i> Recent Neural Milestones
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                 {achievements.filter(a => a.isUnlocked).length > 0 ? (
                   achievements.filter(a => a.isUnlocked).slice(0, 4).map(a => (
                     <div key={a.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex items-center gap-6 group hover:bg-white/[0.03] transition-colors">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform ${rarityMap[a.rarity as keyof typeof rarityMap]}`}>
                           <i className={`fas ${a.icon} text-xl`}></i>
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                             <p className="text-xs font-black text-white uppercase tracking-tight font-orbitron">{a.title}</p>
                             <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">Synced</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.description}</p>
                        </div>
                        <i className="fas fa-chevron-right text-slate-800 group-hover:text-blue-500 transition-colors"></i>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest">No verified milestones detected.</p>
                   </div>
                 )}
              </div>
           </section>
        </div>

        {/* Loadout & Achievements Summary */}
        <div className="space-y-12">
           <section className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                 <i className="fas fa-shield-halved text-emerald-400"></i> Active Synaptic Loadout
              </h2>
              
              <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6 flex flex-col min-h-[440px]">
                 {equippedItems.length > 0 ? (
                   <div className="space-y-4">
                      {equippedItems.map(item => (
                         <div key={item.id} className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform ${rarityMap[item.rarity as keyof typeof rarityMap]}`}>
                               <i className={`fas ${item.icon} text-xl`}></i>
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white uppercase tracking-tight font-orbitron">{item.name}</p>
                               <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Logic Optimized</p>
                            </div>
                         </div>
                      ))}
                   </div>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                      <i className="fas fa-ghost text-5xl mb-2"></i>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Slots Empty</p>
                   </div>
                 )}
                 
                 <div className="pt-8 border-t border-white/5 mt-auto">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Mastery Collection Progress</p>
                    <div className="flex justify-between items-end mb-4">
                       <span className="text-4xl font-black text-white font-orbitron leading-none">{totalUnlocked} <span className="text-slate-700 text-lg">/ {achievements.length}</span></span>
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Milestones</span>
                          <span className="text-[8px] font-bold text-slate-600 uppercase">Unlocked</span>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${(totalUnlocked / achievements.length) * 100}%` }}></div>
                    </div>
                 </div>
              </div>
           </section>

           <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2rem] text-center space-y-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] font-orbitron">Neural Link Integrity</p>
              <div className="flex justify-center gap-3">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className={`w-2.5 h-6 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] ${i <= 5 ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`}></div>
                 ))}
              </div>
              <div className="pt-2">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Explorer operating at <br/> <span className="text-white font-black font-orbitron">94.8% Synaptic Efficiency</span>
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
