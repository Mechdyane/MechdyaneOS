
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getLearningRecommendation } from '../services/geminiService';
import { UserState, LearningModule, ModuleCategory, InventoryItem } from '../types';

interface DashboardProps {
  user: UserState;
  modules: LearningModule[];
  inventory: InventoryItem[];
  onLaunchQuest: (id: string) => void;
  onEnroll: (id: string) => void;
  onRestartQuest?: (id: string) => void;
  onMinimize?: () => void;
  isApiEnabled?: boolean;
  yielded?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  'ALL': 'fa-layer-group',
  [ModuleCategory.ARTS_HUMANITIES]: 'fa-landmark',
  [ModuleCategory.SOCIAL_SCIENCES]: 'fa-people-group',
  [ModuleCategory.EDUCATION]: 'fa-graduation-cap',
  [ModuleCategory.BUSINESS_ECONOMICS]: 'fa-chart-line',
  [ModuleCategory.COMPUTER_SCIENCE]: 'fa-laptop-code',
  [ModuleCategory.ENGINEERING_TECH]: 'fa-microchip',
  [ModuleCategory.NATURAL_SCIENCES]: 'fa-atom',
  [ModuleCategory.HEALTH_SCIENCES]: 'fa-heart-pulse',
  [ModuleCategory.LAW_GOVERNANCE]: 'fa-gavel',
  [ModuleCategory.THEOLOGY_MINISTRY]: 'fa-scroll',
  [ModuleCategory.CREATIVE_DESIGN]: 'fa-palette',
  [ModuleCategory.BEHAVIOR_GAMIFICATION]: 'fa-gamepad',
  [ModuleCategory.UTILITY]: 'fa-gear'
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, modules, inventory, onLaunchQuest, onEnroll, onRestartQuest, onMinimize, isApiEnabled = true, yielded = false
}) => {
  const [recommendation, setRecommendation] = useState<string>("Initializing Neural Suggester...");
  const [isSyncingRec, setIsSyncingRec] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ModuleCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeModule = useMemo(() => {
    return modules.find(m => m.id === user.activeModuleId) || modules.find(m => m.isEnrolled) || modules[0];
  }, [modules, user.activeModuleId]);

  const equippedItems = useMemo(() => inventory.filter(i => i.isEquipped), [inventory]);
  
  const xpBoostDisplay = useMemo(() => {
    const hasLogicCore = equippedItems.some(i => i.name === 'Logic Core');
    return hasLogicCore ? 'x1.1' : 'None';
  }, [equippedItems]);

  const creditBoostDisplay = useMemo(() => {
    const hasCyberLens = equippedItems.some(i => i.name === 'Cyber Lens');
    return hasCyberLens ? '+5 credits' : 'None';
  }, [equippedItems]);

  const suggestedModule = useMemo(() => {
    if (!recommendation || recommendation.includes("Initializing")) return null;
    const lowerRec = recommendation.toLowerCase();
    return modules.find(m => 
      lowerRec.includes(`[${m.title.toLowerCase()}]`) || 
      lowerRec.includes(m.title.toLowerCase())
    );
  }, [recommendation, modules]);

  useEffect(() => {
    const fetchRec = async () => {
      setIsSyncingRec(true);
      if (!isApiEnabled) {
        setTimeout(() => {
          setRecommendation("Archive link detected. Recommending core focus on foundational [Computer Studies: Office Suite] to maintain link stability.");
          setIsSyncingRec(false);
        }, 800);
        return;
      }
      try {
        const moduleTitles = modules.map(m => m.title);
        const rec = await getLearningRecommendation(
          { level: user.level, xp: user.xp }, 
          activeModule?.title || "General Growth",
          moduleTitles
        );
        setRecommendation(rec);
      } catch (e) {
        setRecommendation("Analyze existing Knowledge Nodes to determine optimal growth path.");
      } finally {
        setIsSyncingRec(false);
      }
    };
    fetchRec();
  }, [user.level, user.xp, activeModule, modules, isApiEnabled]);

  const handleAcceptMission = () => {
    if (suggestedModule) {
      if (!suggestedModule.isEnrolled) onEnroll(suggestedModule.id);
      onLaunchQuest(suggestedModule.id);
    } else if (activeModule) {
      onLaunchQuest(activeModule.id);
    }
  };

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchesCategory = activeFilter === 'ALL' || m.category === activeFilter;
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [modules, activeFilter, searchQuery]);

  return (
    <div className={`p-6 md:p-12 space-y-10 animate-in fade-in duration-700 h-full overflow-y-auto bg-[#020617]/40 custom-scrollbar pb-32 transition-opacity duration-700 ${yielded ? 'opacity-30 grayscale-[0.5] pointer-events-none' : 'opacity-100'}`}>
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative group/header">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 p-1">
             <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border border-white/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <i className="fas fa-user-ninja text-2xl text-blue-500/50"></i>
                )}
             </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter font-orbitron leading-none uppercase">
              Operational Hub: <span className={isApiEnabled ? "text-blue-500" : "text-amber-500"}>{user.name}</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
              Neural Link: <span className={isApiEnabled ? "text-emerald-500" : "text-amber-600 animate-pulse"}>{isApiEnabled ? 'Stable' : 'Restricted (Static)'}</span>
              <span className="text-slate-700">|</span>
              Workspace Status: <span className={yielded ? "text-amber-500" : "text-blue-400"}>{yielded ? 'YIELDED (IDLE)' : 'LINK ACTIVE'}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="px-6 py-3 bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 group shadow-2xl"
              title="Yield Node to Focus on Active Tasks"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/40 transition-colors">
                <i className="fas fa-down-left-and-up-right-to-center text-[10px] group-hover:scale-110 transition-transform"></i>
              </div>
              Yield Node
            </button>
          )}
        </div>
      </header>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a]/60 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-fire text-base"></i>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Streak</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-orbitron">{user.streak} Days</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mt-2">Neural Stability 🔥</p>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-medal text-base"></i>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Rank</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-orbitron">Lv. {user.level}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mt-2">Mastery Phase</p>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-coins text-base"></i>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Credits</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-orbitron">{user.credits.toLocaleString()}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-2">Neural Capital</p>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-star text-base"></i>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Total XP</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-orbitron">{user.xp.toLocaleString()}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-2">Explorer Milestone</p>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group sm:col-span-2 md:col-span-1">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-shield-halved text-base"></i>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Verified Nodes</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-orbitron">{user.lessonsFinished}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-purple-500 mt-2">Knowledge Clearance</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a]/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col space-y-8 h-full">
           <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] font-orbitron">Active Loadout</h3>
             <i className="fas fa-shield-halved text-blue-500/30"></i>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-[160px]">
             {equippedItems.length > 0 ? (
               equippedItems.map(item => (
                 <div key={item.id} className="flex items-center gap-5 bg-[#1e293b]/40 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                    <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                       <i className={`fas ${item.icon} text-lg`}></i>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-white uppercase tracking-tight font-orbitron">{item.name}</p>
                       <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Active Buff</p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10 space-y-4">
                  <i className="fas fa-box-open text-4xl"></i>
                  <p className="text-[9px] font-black uppercase tracking-widest">No artifacts equipped</p>
               </div>
             )}
           </div>

           <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
             <div className="space-y-2">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">XP Mult.</p>
               <p className={`text-sm font-black font-orbitron ${xpBoostDisplay !== 'None' ? 'text-blue-400' : 'text-slate-700'}`}>
                 {xpBoostDisplay}
               </p>
             </div>
             <div className="space-y-2">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CRD Boost</p>
               <p className={`text-sm font-black font-orbitron ${creditBoostDisplay !== 'None' ? 'text-emerald-400' : 'text-slate-700'}`}>
                 {creditBoostDisplay}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* DYNAMIC NEURAL SUGGESTER */}
      <div className="relative group">
        <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-10 transition duration-1000 ${suggestedModule ? (isApiEnabled ? 'bg-emerald-600' : 'bg-amber-600') + ' opacity-20 animate-pulse' : 'bg-blue-600'}`}></div>
        <div className={`relative bg-slate-900/90 border rounded-[2.5rem] p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 shadow-2xl transition-all duration-500 overflow-hidden ${suggestedModule ? (isApiEnabled ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-amber-500/40 shadow-amber-500/10') : 'border-blue-500/20 shadow-blue-500/10'}`}>
           {isSyncingRec && (
             <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
           )}

           <div className="flex flex-col items-center gap-4 shrink-0">
             <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-all duration-700 relative ${suggestedModule ? (isApiEnabled ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400' : 'bg-amber-600/10 border-amber-500/40 text-amber-500') + ' rotate-0' : 'bg-blue-600/10 border-blue-500/40 text-blue-400 rotate-45 group-hover:rotate-0'}`}>
                {isSyncingRec ? (
                  <i className="fas fa-satellite-dish text-4xl animate-spin"></i>
                ) : (
                  <>
                    <i className={`fas ${suggestedModule ? suggestedModule.icon : 'fa-brain'} text-4xl ${suggestedModule ? 'animate-pulse' : ''}`}></i>
                    {suggestedModule && (
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center text-[10px] text-white shadow-lg ${isApiEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </>
                )}
             </div>
             <div className="text-center">
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] font-orbitron ${suggestedModule ? (isApiEnabled ? 'text-emerald-500' : 'text-amber-500') : 'text-blue-500'}`}>
                  {isSyncingRec ? 'Syncing...' : (suggestedModule ? (isApiEnabled ? 'Lock-On' : 'Archive Lock') : 'Ready')}
                </p>
             </div>
           </div>

           <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={`text-[11px] font-black uppercase tracking-[0.5em] font-orbitron ${suggestedModule ? (isApiEnabled ? 'text-emerald-400' : 'text-amber-400') : 'text-blue-400'}`}>
                  {suggestedModule ? (isApiEnabled ? 'Neural Mission: Personalized Node' : 'Archive Mission: Critical Vector') : 'Adaptive Neural Analysis'}
                </h3>
              </div>
              
              <div className="glass bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                <p className="text-slate-200 text-base md:text-lg font-medium leading-relaxed italic">
                   "{recommendation}"
                </p>
              </div>

              {suggestedModule && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Potential</p>
                      <p className="text-sm font-black text-white font-orbitron">1,200+</p>
                   </div>
                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sync Difficulty</p>
                      <p className={`text-sm font-black font-orbitron ${isApiEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>{suggestedModule.difficulty || 'Scalable'}</p>
                   </div>
                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Sync</p>
                      <p className={`text-sm font-black font-orbitron ${isApiEnabled ? 'text-blue-400' : 'text-amber-500'}`}>{suggestedModule.progress}%</p>
                   </div>
                   <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Knowledge Sector</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate font-orbitron">{suggestedModule.category}</p>
                   </div>
                </div>
              )}
           </div>

           <div className="flex flex-col gap-4 w-full lg:w-auto">
             <button 
               disabled={isSyncingRec}
               onClick={handleAcceptMission}
               className={`w-full lg:px-12 py-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all font-orbitron hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 ${suggestedModule ? (isApiEnabled ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30') : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'} text-white`}
             >
               <i className={`fas ${suggestedModule ? 'fa-rocket' : 'fa-brain'} text-base ${suggestedModule ? 'animate-bounce' : ''}`}></i>
               {suggestedModule ? (suggestedModule.isEnrolled ? (isApiEnabled ? 'Resume Link' : 'Resume Archive') : (isApiEnabled ? 'Initiate Link' : 'Initiate Archive')) : 'Begin Scan'}
             </button>
             {suggestedModule && isApiEnabled && (
               <button 
                 onClick={() => setRecommendation("Analyzing alternative neural pathways...")}
                 className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2"
               >
                 Recalculate Vectors
               </button>
             )}
           </div>
        </div>
      </div>

      {/* REPOSITORY FILTER & LIST */}
      <section className="space-y-8 pt-6 border-t border-white/5">
        <div className="flex flex-col gap-8 px-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 font-orbitron">Knowledge Nodes</p>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-orbitron">Global Library</h2>
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <i className={`fas fa-search text-xs transition-colors ${searchQuery ? 'text-blue-400' : 'text-slate-600'}`}></i>
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query knowledge base..."
                className="w-full bg-[#0f172a]/80 border border-white/5 rounded-full py-5 pl-14 pr-14 text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-6 flex items-center text-slate-600 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              )}
            </div>

            <div className="relative">
              <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
                {['ALL', ...Object.values(ModuleCategory)].map(cat => {
                  const isActive = activeFilter === cat;
                  const icon = CATEGORY_ICONS[cat] || 'fa-cube';
                  return (
                    <button 
                      key={cat}
                      onClick={() => setActiveFilter(cat as any)}
                      className={`
                        flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap shrink-0 group
                        ${isActive 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                        }
                      `}
                    >
                      <i className={`fas ${icon} text-xs transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}></i>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredModules.length > 0 ? (
            filteredModules.map(module => {
              const isTarget = suggestedModule?.id === module.id;
              return (
                <div 
                  key={module.id} 
                  className={`group glass rounded-[2.5rem] p-8 border transition-all duration-500 flex flex-col min-h-[300px] relative overflow-hidden ${isTarget ? (isApiEnabled ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]') + ' ring-1' : 'border-white/5 hover:border-blue-500/20 hover:shadow-2xl'}`}
                >
                  {isTarget && (
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full border ${isApiEnabled ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                      <i className="fas fa-crosshairs text-[8px] animate-pulse"></i>
                      <span className="text-[8px] font-black uppercase tracking-widest">{isApiEnabled ? 'Suggested Mission' : 'Archive Mission'}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${module.color || 'bg-slate-800'} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <i className={`fas ${module.icon} text-2xl`}></i>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-[8px] font-black uppercase tracking-widest block mb-1 ${module.isEnrolled ? (isApiEnabled ? 'text-blue-400' : 'text-amber-400') : 'text-slate-600'}`}>
                        {module.isEnrolled ? `Sync: ${module.progress}%` : 'Not Initialized'}
                      </span>
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div 
                           className={`h-full transition-all duration-1000 ${module.isEnrolled ? (isApiEnabled ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]') : 'bg-slate-800'}`} 
                           style={{ width: `${module.isEnrolled ? module.progress : 0}%` }}
                         ></div>
                      </div>
                      <p className="text-[7px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">
                        {module.lessonsFinished} / {module.totalLessons} Nodes
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight font-orbitron">{module.title}</h3>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-4">{module.category}</p>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-auto">
                    {module.description}
                  </p>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button 
                      onClick={() => module.isEnrolled ? onLaunchQuest(module.id) : onEnroll(module.id)}
                      className={`w-full py-4 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 font-orbitron ${module.isEnrolled ? (isApiEnabled ? 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-500' : 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-500') + ' text-white shadow-lg' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                    >
                      <i className={`fas ${module.isEnrolled ? (isApiEnabled ? 'fa-bolt' : 'fa-box-archive') : 'fa-play'}`}></i>
                      {module.isEnrolled ? (isApiEnabled ? 'Resume Stream' : 'Open Archive') : (module.lessonsFinished > 0 ? 'Restart Node' : 'Initialize Node')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem]">
              <div className="w-20 h-20 rounded-full bg-slate-900/50 border border-white/5 flex items-center justify-center mx-auto text-slate-700">
                <i className="fas fa-search-minus text-3xl"></i>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-black uppercase text-sm tracking-widest font-orbitron">No Neural Matches Detected</p>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Refine your query or adjust the sector filter</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
