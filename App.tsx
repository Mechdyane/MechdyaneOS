
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Taskbar from './components/Taskbar';
import Desktop from './components/Desktop';
import Window from './components/Window';
import StartMenu from './components/StartMenu';
import GlobalSearch from './components/GlobalSearch';
import Assistant from './pages/Assistant';
import Emotions from './pages/Emotions';
import AppManager from './pages/AppManager';
import Settings from './pages/Settings';
import ControlPanel from './pages/ControlPanel';
import Calendar from './pages/Calendar';
import Armory from './pages/Armory';
import Achievements from './pages/Achievements';
import MindMapper from './pages/MindMapper';
import FocusTimer from './pages/FocusTimer';
import SmartCalc from './pages/SmartCalc';
import NeuralStream from './pages/NeuralStream';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CourseCreator from './pages/CourseCreator';
import OSHelper from './pages/OSHelper';
import BountyBoard from './pages/BountyBoard';
import { SOFTWARE_CATALOG, MODULES as INITIAL_MODULES, INITIAL_USER, INITIAL_ACHIEVEMENTS, INITIAL_INVENTORY } from './constants';
import { AppId, LearningModule, UserState, Achievement, InventoryItem, RewardToast, SystemError } from './types';
import { generateDynamicLessonContent } from './services/geminiService';

interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('mechdyane_user');
    return saved ? JSON.parse(saved) : { ...INITIAL_USER, badges: [] };
  });
  const [modules, setModules] = useState<LearningModule[]>(() => {
    const saved = localStorage.getItem('mechdyane_modules');
    return saved ? JSON.parse(saved) : INITIAL_MODULES;
  });
  const [installedAppIds, setInstalledAppIds] = useState<AppId[]>(() => {
    const saved = localStorage.getItem('mechdyane_installed');
    return saved ? JSON.parse(saved) : SOFTWARE_CATALOG.filter(a => a.isSystem).map(a => a.id);
  });
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('mechdyane_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('mechdyane_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [claimedBountyIds, setClaimedBountyIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mechdyane_claimed_bounties');
    return saved ? JSON.parse(saved) : [];
  });

  const [focusMode, setFocusMode] = useState<boolean>(localStorage.getItem('mechdyane_focus') === 'true');
  const [isApiEnabled, setIsApiEnabled] = useState(() => localStorage.getItem('mechdyane_api_enabled') !== 'false');
  const [synapticPulse, setSynapticPulse] = useState<number>(Number(localStorage.getItem('mechdyane_pulse')) || 1);

  const [windows, setWindows] = useState<Record<AppId, WindowState>>({});
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [maxZ, setMaxZ] = useState(100);
  const [rewardToasts, setRewardToasts] = useState<RewardToast[]>([]);

  // --- LEARNING ENGINE ---
  const [activeLearningModuleId, setActiveLearningModuleId] = useState<string | null>(null);
  const [learningStep, setLearningStep] = useState<'lesson' | 'loading' | 'quiz' | 'result' | 'error'>('lesson');
  const [dynamicMilestone, setDynamicMilestone] = useState<any>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [lessonScore, setLessonScore] = useState(0);
  const [quizSelection, setQuizSelection] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const activeLearningModule = useMemo(() => 
    modules.find(m => m.id === activeLearningModuleId),
    [modules, activeLearningModuleId]
  );

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('mechdyane_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('mechdyane_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('mechdyane_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('mechdyane_modules', JSON.stringify(modules)); }, [modules]);
  useEffect(() => { localStorage.setItem('mechdyane_claimed_bounties', JSON.stringify(claimedBountyIds)); }, [claimedBountyIds]);
  useEffect(() => { localStorage.setItem('mechdyane_focus', String(focusMode)); }, [focusMode]);

  // --- SMART SIDEBAR OBSERVER ---
  useEffect(() => {
    const allWindows = Object.values(windows) as WindowState[];
    const openWindows = allWindows.filter(w => w.isOpen);
    const anyMaximized = openWindows.some(w => w.isMaximized);
    const nonDashFocused = activeApp && activeApp !== 'dashboard';
    const shouldHide = anyMaximized || (nonDashFocused && openWindows.length > 0);
    const isWorkspaceClear = openWindows.length === 0 || openWindows.every(w => w.isMinimized);

    if (shouldHide && !isSidebarHidden) setIsSidebarHidden(true);
    else if (isWorkspaceClear && isSidebarHidden) setIsSidebarHidden(false);
  }, [windows, activeApp, isSidebarHidden]);

  // --- REWARDS ---
  const triggerRewardToast = (amount: string, type: 'xp' | 'credits' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setRewardToasts(prev => [...prev, { id, amount, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setRewardToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const processPointGain = (xpGain: number, creditGain: number) => {
    triggerRewardToast(`+${xpGain}`, 'xp');
    triggerRewardToast(`+${creditGain}`, 'credits');

    setUser(prev => {
      const nextTotalXp = prev.xp + xpGain;
      return { ...prev, xp: nextTotalXp, credits: prev.credits + creditGain, level: Math.floor(nextTotalXp / 1000) + 1 };
    });
  };

  // --- WINDOWS ---
  const openApp = useCallback((id: AppId, title?: string, icon?: string, fromTaskbar: boolean = false) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    const existing = windows[id];
    
    if (fromTaskbar && activeApp === id && existing?.isOpen && !existing?.isMinimized) {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
      setActiveApp(null);
      return;
    }

    setWindows(prev => {
      const win = prev[id];
      if (win && win.isOpen) {
        return { ...prev, [id]: { ...win, isMinimized: false, zIndex: newZ } };
      }
      const mod = modules.find(m => m.id === id);
      const appInfo = SOFTWARE_CATALOG.find(a => a.id === id);
      return {
        ...prev,
        [id]: {
          id, title: title || mod?.title || appInfo?.name || id, icon: icon || mod?.icon || appInfo?.icon || 'fa-cube',
          isOpen: true, isMinimized: false, isMaximized: false, zIndex: newZ
        }
      };
    });

    setActiveApp(id);
    setIsStartOpen(false);

    const mod = modules.find(m => m.id === id);
    if (mod && (!existing || !existing.isOpen)) {
      setActiveLearningModuleId(id);
      loadLessonContent(mod);
    }
  }, [maxZ, activeApp, modules, windows]);

  const closeApp = (id: AppId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
    if (activeApp === id) setActiveApp(null);
  };

  const focusApp = (id: AppId) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ, isMinimized: false } }));
    setActiveApp(id);
  };

  const loadLessonContent = async (mod: LearningModule) => {
    setLearningStep('loading');
    setCurrentQuizIndex(0);
    setLessonScore(0);
    setQuizSelection(null);
    try {
      const dynamicData = await generateDynamicLessonContent(mod.title, mod.lessonsFinished + 1, user.level);
      setDynamicMilestone(dynamicData);
      setLearningStep('lesson');
    } catch (e) {
      setLearningStep('error');
    }
  };

  const handleCheckAnswer = () => {
    if (!activeLearningModule || !quizSelection || !dynamicMilestone) return;
    const currentQuiz = dynamicMilestone.quizzes[currentQuizIndex];
    if (currentQuiz.correctLetter === quizSelection) {
      setQuizFeedback('correct');
      setLessonScore(prev => prev + 1);
      setTimeout(() => {
        if (currentQuizIndex < dynamicMilestone.quizzes.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setQuizSelection(null);
          setQuizFeedback(null);
        } else {
          const nextFinished = activeLearningModule.lessonsFinished + 1;
          const nextProgress = Math.floor((nextFinished / activeLearningModule.totalLessons) * 100);
          setModules(m => m.map(item => item.id === activeLearningModule.id ? { ...item, lessonsFinished: nextFinished, progress: nextProgress } : item));
          processPointGain(150, 50); 
          setLearningStep('result');
        }
      }, 800);
    } else {
      setQuizFeedback('incorrect');
      setTimeout(() => {
        if (currentQuizIndex < dynamicMilestone.quizzes.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setQuizSelection(null);
          setQuizFeedback(null);
        } else setLearningStep('result');
      }, 1500);
    }
  };

  return (
    <div className={`h-screen w-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden transition-all duration-1000 ${focusMode ? 'grayscale-[0.6] brightness-[0.7] sepia-[0.1]' : ''}`}>
      <Sidebar onLaunch={(id) => openApp(id)} user={user} activeApp={activeApp} isHidden={isSidebarHidden} />
      <div className="flex-1 flex flex-col relative h-full transition-all duration-700">
        <main className="relative flex-1 z-10 p-2 md:p-6 h-[calc(100vh-56px)] overflow-hidden">
          <Desktop installedAppIds={installedAppIds} onIconClick={(id) => openApp(id)} />
          
          {(Object.values(windows) as WindowState[]).map(win => {
            const mod = modules.find(m => m.id === win.id);
            return win.isOpen && (
              <Window key={win.id} {...win} isActive={activeApp === win.id} onClose={() => closeApp(win.id)} onFocus={() => focusApp(win.id)} onMinimize={() => setWindows(p => ({...p, [win.id]: {...p[win.id], isMinimized: true}}))} onMaximize={() => setWindows(p => ({...p, [win.id]: {...p[win.id], isMaximized: !p[win.id].isMaximized}}))}>
                {mod ? (
                  <LearningEngineOverlay user={user} module={mod} milestone={dynamicMilestone} step={learningStep} currentQuizIndex={currentQuizIndex} currentScore={lessonScore} onClose={() => closeApp(win.id)} onNextStep={() => setLearningStep('quiz')} onQuizSelect={setQuizSelection} onCheckAnswer={handleCheckAnswer} onNextLesson={() => loadLessonContent(mod)} onResultClose={() => closeApp(mod.id)} selectedAnswer={quizSelection} feedback={quizFeedback} />
                ) : (
                  <>
                    {win.id === 'dashboard' && <Dashboard user={user} modules={modules} inventory={inventory} onLaunchQuest={(id) => openApp(id)} onEnroll={(id) => setModules(m => m.map(item => item.id === id ? {...item, isEnrolled: true} : item))} onMinimize={() => setWindows(prev => ({...prev, dashboard: {...prev.dashboard, isMinimized: true}}))} isApiEnabled={isApiEnabled} yielded={win.isMinimized} />}
                    {win.id === 'profile' && <Profile user={user} modules={modules} achievements={achievements} inventory={inventory} onUpdateUser={(u) => setUser(p => ({ ...p, ...u }))} />}
                    {win.id === 'armory' && <Armory user={user} inventory={inventory} onBuy={(id) => { const item = inventory.find(i => i.id === id); if(item && user.credits >= item.cost) { setInventory(p => p.map(i => i.id === id ? { ...i, isOwned: true } : i)); setUser(u => ({ ...u, credits: u.credits - item.cost })); } }} onEquip={(id) => setInventory(p => p.map(i => i.id === id ? { ...i, isEquipped: !i.isEquipped } : i))} />}
                    {win.id === 'trophy-room' && <Achievements achievements={achievements} user={user} modules={modules} />}
                    {win.id === 'bounty-board' && <BountyBoard user={user} modules={modules} claimedIds={claimedBountyIds} onClaim={(xp, cr, bid) => { setClaimedBountyIds(p => [...p, bid]); processPointGain(xp, cr); }} isApiEnabled={isApiEnabled} />}
                    {win.id === 'control-panel' && <ControlPanel focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} />}
                    {win.id === 'neural-stream' && <NeuralStream isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} pulseSpeed={synapticPulse} />}
                    {win.id === 'mindmap' && <MindMapper />}
                    {win.id === 'timer' && <FocusTimer />}
                    {win.id === 'calc' && <SmartCalc />}
                    {win.id === 'assistant' && <Assistant isApiEnabled={isApiEnabled} />}
                    {win.id === 'appmanager' && <AppManager installedAppIds={installedAppIds} onInstall={(id) => setInstalledAppIds(p => [...p, id])} onUninstall={(id) => setInstalledAppIds(p => p.filter(a => a !== id))} onOpen={(id) => openApp(id)} />}
                    {win.id === 'course-creator' && <CourseCreator onAddModule={(m) => setModules(p => [...p, m])} />}
                    {win.id === 'calendar' && <Calendar />}
                    {win.id === 'os-helper' && <OSHelper />}
                    {win.id === 'settings' && <Settings wallpaper="" setWallpaper={()=>{}} focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} />}
                    {win.id === 'journal' && <Emotions />}
                  </>
                )}
              </Window>
            );
          })}

          <div className="fixed bottom-20 right-8 z-[100000] flex flex-col gap-3 items-end pointer-events-none">
            {rewardToasts.map(toast => (
              <div key={toast.id} className={`flex items-center gap-4 px-8 py-4 rounded-2xl border backdrop-blur-xl animate-in slide-in-from-right-16 fade-in duration-500 ${toast.type === 'xp' ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : toast.type === 'credits' ? 'bg-amber-600/20 border-amber-500/40 text-amber-400' : 'bg-red-600/20 border-red-500/40 text-red-400'}`}>
                <i className={`fas ${toast.type === 'xp' ? 'fa-dna' : toast.type === 'credits' ? 'fa-coins' : 'fa-triangle-exclamation'} text-lg`}></i>
                <span className="font-orbitron font-black text-base">{toast.amount} {toast.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </main>
        <Taskbar isApiEnabled={isApiEnabled} windows={(Object.values(windows) as WindowState[]).filter(w => w.isOpen)} activeApp={activeApp} onAppClick={(id) => openApp(id, undefined, undefined, true)} onCloseApp={closeApp} onMinimizeApp={(id) => setWindows(p => ({...p, [id]: {...p[id], isMinimized: true}}))} onStartClick={() => setIsStartOpen(!isStartOpen)} onControlClick={() => openApp('control-panel')} onCalendarClick={() => openApp('calendar')} />
      </div>

      {isStartOpen && (
        <StartMenu 
          installedAppIds={installedAppIds} 
          onClose={() => setIsStartOpen(false)} 
          onLaunch={(id) => openApp(id)} 
        />
      )}
      
      <GlobalSearch 
        isOpen={false} 
        onClose={() => {}} 
        onLaunch={(id) => openApp(id)} 
      />
    </div>
  );
};

const LearningEngineOverlay: React.FC<any> = ({ user, module, milestone, step, currentQuizIndex, currentScore, onClose, onNextStep, onQuizSelect, onCheckAnswer, onNextLesson, onResultClose, selectedAnswer, feedback }) => {
  // Common calculation for level progress
  const progressInLevel = user.xp % 1000;
  const xpPercentage = Math.min(100, (progressInLevel / 1000) * 100);

  if (step === 'loading') return (
    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 bg-[#020617]/90 text-center backdrop-blur-2xl">
      <div className="relative mb-12 group">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500/10 flex items-center justify-center relative">
          <i className="fas fa-bolt-lightning text-4xl md:text-6xl text-blue-500 animate-pulse drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"></i>
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-400 animate-spin"></div>
        </div>
        <div className="absolute -inset-8 bg-blue-500/10 blur-[60px] rounded-full animate-pulse"></div>
      </div>
      
      <h3 className="text-2xl md:text-3xl font-black text-white font-orbitron uppercase tracking-[0.2em] leading-none mb-10">Curriculum Synthesis</h3>
      
      {/* Level Progress during loading */}
      <div className="w-full max-w-sm space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Rank {user.level} Sync</span>
          <span className="text-xs font-black text-blue-400 font-orbitron">{progressInLevel} / 1000 XP</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] transition-all duration-1000 ease-out" 
            style={{ width: `${xpPercentage}%` }}
          >
            <div className="absolute inset-0 shimmer-effect opacity-50"></div>
          </div>
        </div>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.5em] animate-pulse pt-2">Establishing Link with Core AI...</p>
      </div>
    </div>
  );
  
  if (step === 'lesson') return (
    <div className="h-full flex flex-col bg-[#020617]/60 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[7px] md:text-[8px] font-black uppercase font-orbitron tracking-widest">Layer {module.lessonsFinished + 1} / 12</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tighter leading-tight">{milestone?.title}</h1>
      </header>
      <div className="bg-slate-900/60 p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/5 text-slate-300 text-sm md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
        {milestone?.content}
      </div>
      <div className="p-4 md:p-10 bg-slate-900/80 border-t border-white/10 flex flex-col md:flex-row justify-end gap-3 md:gap-6 mt-auto">
        <button onClick={onClose} className="w-full md:w-auto px-6 md:px-10 py-3 md:py-4 bg-white/5 text-slate-500 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] uppercase font-black tracking-widest">Abort Link</button>
        <button onClick={onNextStep} className="w-full md:w-auto px-8 md:px-16 py-4 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] uppercase font-black tracking-widest shadow-2xl font-orbitron">Initiate Mastery</button>
      </div>
    </div>
  );

  if (step === 'quiz') {
    const q = milestone?.quizzes?.[currentQuizIndex];
    if (!q) return null;
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar">
        <header className="text-center px-4 max-w-4xl">
          <p className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] md:tracking-[0.5em] mb-2 md:mb-4 font-orbitron">Verification Step {currentQuizIndex + 1}/5</p>
          <h2 className="text-lg md:text-3xl font-black text-white font-orbitron uppercase leading-snug md:leading-tight text-center tracking-tight drop-shadow-lg">{q.question}</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 w-full max-w-5xl px-4">
          {q.options.map((opt: any) => (
            <button 
              key={opt.letter} 
              onClick={() => onQuizSelect(opt.letter)} 
              className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all text-left flex items-center gap-4 md:gap-8 relative overflow-hidden group/opt ${
                selectedAnswer === opt.letter 
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/50' 
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/30 hover:bg-slate-900/80 hover:scale-[1.01]'
              }`}
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center font-black font-orbitron text-base md:text-xl shrink-0 transition-colors ${
                selectedAnswer === opt.letter ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600 group-hover/opt:text-blue-400'
              }`}>
                {opt.letter}
              </div>
              <span className={`font-bold text-xs md:text-lg leading-snug transition-colors ${
                selectedAnswer === opt.letter ? 'text-white' : 'group-hover/opt:text-slate-200'
              }`}>{opt.text}</span>
              
              {selectedAnswer === opt.letter && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500/30 text-2xl md:text-4xl">
                  <i className="fas fa-check-circle"></i>
                </div>
              )}
            </button>
          ))}
        </div>
        <button 
          onClick={onCheckAnswer} 
          disabled={!selectedAnswer || !!feedback} 
          className="w-full max-w-xs md:max-w-sm px-10 md:px-16 py-4 md:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] font-orbitron disabled:opacity-20 shadow-[0_15px_40px_rgba(59,130,246,0.25)] transition-all active:scale-95 mb-6"
        >
          {feedback === 'correct' ? 'Link Synchronized' : feedback === 'incorrect' ? 'Retrying Link...' : 'Confirm Selection'}
        </button>
      </div>
    );
  }

  if (step === 'result') {
    const isSuccess = currentScore >= 4;
    return (
      <div className="h-full flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
        <div className="bg-[#0f172a]/90 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-white/10 text-center space-y-6 md:space-y-10 max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden my-4">
          
          {/* Neural Badge Visualization */}
          <div className="relative group">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl md:text-6xl text-white relative transition-all duration-1000 ${isSuccess ? 'bg-gradient-to-tr from-emerald-500 to-blue-600 shadow-[0_0_40px_rgba(16,185,129,0.4)] rotate-0' : 'bg-red-600 shadow-red-500/40 rotate-12'}`}>
              <i className={`fas ${isSuccess ? 'fa-certificate' : 'fa-skull-crossbones'} ${isSuccess ? 'animate-pulse' : ''}`}></i>
              {isSuccess && <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/40 animate-ping"></div>}
            </div>
            {isSuccess && (
              <div className="mt-4 animate-in slide-in-from-bottom-4">
                <span className="text-[9px] md:text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] font-orbitron drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">Neural Badge Decoded</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black text-white font-orbitron uppercase tracking-tighter leading-none">{isSuccess ? 'Link Verified' : 'Sync Denied'}</h1>
            <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{isSuccess ? 'Synaptic integration established successfully' : 'Incomplete neural alignment detected'}</p>
          </div>

          {/* Level Progress Display with XP gain */}
          <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-4 shadow-inner">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-orbitron mb-1">Rank {user.level} Trajectory</p>
                <p className="text-xs md:text-sm font-black text-white font-orbitron">{progressInLevel} <span className="text-slate-700 text-[10px]">/ 1000 XP</span></p>
              </div>
              <div className="text-right">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest font-orbitron animate-bounce ${isSuccess ? 'text-blue-400' : 'text-red-500'}`}>
                  {isSuccess ? '+150 XP GAINED' : '0 XP'}
                </p>
              </div>
            </div>
            <div className="w-full h-2 md:h-3 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,1)] relative"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute inset-0 shimmer-effect opacity-30"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <button onClick={isSuccess ? onNextLesson : onClose} className="w-full py-5 md:py-6 bg-blue-600 text-white rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] font-orbitron shadow-2xl transition-all hover:scale-105 active:scale-95 hover:bg-blue-500">
              {isSuccess ? 'Advance Layer' : 'Retry Verification'}
            </button>
            <button onClick={onResultClose} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-[0.4em] transition-colors font-orbitron py-1.5">
              TERMINATE SESSION
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default App;
