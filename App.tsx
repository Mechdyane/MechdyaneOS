
import React, { useState, useEffect, useMemo } from 'react';
import Taskbar from './components/Taskbar';
import Desktop from './components/Desktop';
import Window from './components/Window';
import StartMenu from './components/StartMenu';
import GlobalSearch from './components/GlobalSearch';
import Assistant from './pages/Assistant';
import Emotions from './pages/Emotions';
import AppManager from './pages/AppManager';
import Settings from './pages/Settings';
import StudentPortal from './pages/StudentPortal';
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
import { SOFTWARE_CATALOG, MODULES as INITIAL_MODULES, INITIAL_USER, INITIAL_ACHIEVEMENTS, INITIAL_INVENTORY } from './constants';
import { AppId, LearningModule, UserState, Achievement, InventoryItem } from './types';
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

  const [wallpaper, setWallpaper] = useState<string>(localStorage.getItem('mechdyane_wallpaper') || 'os-grid');
  const [focusMode, setFocusMode] = useState<boolean>(localStorage.getItem('mechdyane_focus') === 'true');
  const [synapticPulse, setSynapticPulse] = useState<number>(Number(localStorage.getItem('mechdyane_pulse')) || 1);
  const [enrollmentSuccessTitle, setEnrollmentSuccessTitle] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<Achievement | null>(null);

  const [windows, setWindows] = useState<Record<AppId, WindowState>>({});
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [maxZ, setMaxZ] = useState(100);
  const [activeLearningModuleId, setActiveLearningModuleId] = useState<string | null>(null);
  const [learningStep, setLearningStep] = useState<'lesson' | 'loading' | 'quiz' | 'result' | 'error'>('lesson');
  const [quizSelection, setQuizSelection] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [dynamicMilestone, setDynamicMilestone] = useState<any>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [lessonScore, setLessonScore] = useState(0);
  const [isApiEnabled, setIsApiEnabled] = useState(() => localStorage.getItem('mechdyane_api_enabled') !== 'false');

  const activeLearningModule = useMemo(() => 
    modules.find(m => m.id === activeLearningModuleId), 
    [modules, activeLearningModuleId]
  );

  const equippedItems = useMemo(() => inventory.filter(i => i.isEquipped), [inventory]);
  
  const xpMultiplier = useMemo(() => {
    const hasLogicCore = equippedItems.some(i => i.name === 'Logic Core');
    return hasLogicCore ? 1.1 : 1.0;
  }, [equippedItems]);

  const creditBonus = useMemo(() => {
    const hasCyberLens = equippedItems.some(i => i.name === 'Cyber Lens');
    return hasCyberLens ? 5 : 0;
  }, [equippedItems]);

  useEffect(() => {
    localStorage.setItem('mechdyane_user', JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    localStorage.setItem('mechdyane_achievements', JSON.stringify(achievements));
  }, [achievements]);
  useEffect(() => {
    localStorage.setItem('mechdyane_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('mechdyane_modules', JSON.stringify(modules));
  }, [modules]);
  useEffect(() => {
    localStorage.setItem('mechdyane_api_enabled', String(isApiEnabled));
  }, [isApiEnabled]);

  // Update global CSS variables for animations
  useEffect(() => {
    const effectivePulse = isApiEnabled ? synapticPulse : synapticPulse * 0.2;
    document.documentElement.style.setProperty('--pulse-speed', effectivePulse.toString());
  }, [isApiEnabled, synapticPulse]);

  const loadLessonContent = async (mod: LearningModule) => {
    setCurrentQuizIndex(0);
    setLessonScore(0);
    const lessonNum = mod.lessonsFinished + 1;
    setLearningStep('loading');
    
    if (!isApiEnabled) {
      // STATIC MODE: Use pre-defined milestones from constants
      setTimeout(() => {
        const localMilestone = mod.milestones[mod.lessonsFinished];
        if (localMilestone) {
          setDynamicMilestone(localMilestone);
          setLearningStep('lesson');
        } else {
          setLearningStep('error');
        }
      }, 1500);
      return;
    }

    try {
        const dynamicData = await generateDynamicLessonContent(mod.title, lessonNum, user.level);
        if (dynamicData) {
          setDynamicMilestone(dynamicData);
          setLearningStep('lesson');
        } else {
          throw new Error("Empty Response");
        }
    } catch (e) {
        // Fallback to local if AI fails
        const localFallback = mod.milestones[mod.lessonsFinished];
        if (localFallback) {
          setDynamicMilestone(localFallback);
          setLearningStep('lesson');
        } else {
          setLearningStep('error');
        }
    }
  };

  const handleManualFallback = () => {
    if (activeLearningModule) {
      const localMilestone = activeLearningModule.milestones[activeLearningModule.lessonsFinished];
      if (localMilestone) {
        setDynamicMilestone(localMilestone);
        setLearningStep('lesson');
      }
    }
  };

  const openApp = async (id: AppId, title?: string, icon?: string) => {
    let mod = modules.find(m => m.id === id);
    if (mod) {
      setActiveLearningModuleId(mod.id);
      setActiveApp(mod.id);
      
      setWindows(prev => {
        const existing = prev[id];
        const newZ = maxZ + 1;
        setMaxZ(newZ);
        if (existing && existing.isOpen) {
          return { ...prev, [id]: { ...existing, isMinimized: false, zIndex: newZ } };
        }
        return {
          ...prev,
          [id]: {
            id,
            title: mod.title,
            icon: mod.icon,
            isOpen: true,
            isMinimized: false,
            isMaximized: false, // Knowledge Nodes now open in windowed mode by default for better accessibility
            zIndex: newZ
          }
        };
      });

      await loadLessonContent(mod);
      return;
    }

    setWindows(prev => {
      const existing = prev[id];
      const newZ = maxZ + 1;
      setMaxZ(newZ);
      if (existing && existing.isOpen) {
        setActiveApp(id);
        return { ...prev, [id]: { ...existing, isMinimized: false, zIndex: newZ } };
      }
      return {
        ...prev,
        [id]: {
          id,
          title: title || SOFTWARE_CATALOG.find(a => a.id === id)?.name || id,
          icon: icon || SOFTWARE_CATALOG.find(a => a.id === id)?.icon || 'fa-cube',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ
        }
      };
    });
    setActiveApp(id);
    setIsStartOpen(false);
  };

  const closeApp = (id: AppId) => {
    if (activeLearningModuleId === id) setActiveLearningModuleId(null);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
    if (activeApp === id) setActiveApp(null);
  };

  const checkAchievements = (updatedUser: UserState) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.isUnlocked) return ach;
      
      let progress = ach.progress;
      let isUnlocked = false;

      if (ach.id === 'steady-flow') progress = updatedUser.streak;
      if (ach.id === 'polymath') progress = modules.filter(m => m.progress >= 100).length;
      if (ach.id === 'deep-dive') progress = updatedUser.lessonsFinished >= 1 ? 1 : 0;

      if (progress >= ach.target) {
        isUnlocked = true;
        setNewBadge(ach);
        setTimeout(() => setNewBadge(null), 5000);
      }

      return { ...ach, progress, isUnlocked };
    }));
  };

  const handleEnroll = (moduleId: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, isEnrolled: true } : m));
    setUser(prev => ({ ...prev, activeModuleId: moduleId }));
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setEnrollmentSuccessTitle(mod.title);
      setTimeout(() => setEnrollmentSuccessTitle(null), 3500);
    }
  };

  const handleCheckAnswer = () => {
    if (!activeLearningModule || !quizSelection || !dynamicMilestone) return;
    const currentQuiz = dynamicMilestone.quizzes[currentQuizIndex];
    const correct = currentQuiz.correctLetter === quizSelection;

    if (correct) {
      setQuizFeedback('correct');
      setLessonScore(prev => prev + 1);
      setTimeout(() => {
        if (currentQuizIndex < dynamicMilestone.quizzes.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setQuizSelection(null);
          setQuizFeedback(null);
        } else {
          const nextLessonsFinished = activeLearningModule.lessonsFinished + 1;
          const nextProgress = Math.floor((nextLessonsFinished / activeLearningModule.totalLessons) * 100);
          setModules(prev => prev.map(m => m.id === activeLearningModule.id ? { ...m, lessonsFinished: nextLessonsFinished, progress: nextProgress } : m));
          
          const earnedXp = Math.round(100 * xpMultiplier);
          const earnedCredits = 50 + creditBonus;

          setUser(prev => {
            const nextXp = prev.xp + earnedXp;
            const nextLevel = Math.floor(nextXp / 1000) + 1;
            const updated = { ...prev, xp: nextXp, level: nextLevel, credits: prev.credits + earnedCredits, lessonsFinished: prev.lessonsFinished + 1 };
            checkAchievements(updated);
            return updated;
          });
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
    <div className={`h-screen w-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-hidden transition-all duration-1000 ${focusMode ? 'grayscale-[0.4] brightness-[0.8]' : ''} ${!isApiEnabled ? 'saturate-[0.8] contrast-[1.05]' : ''}`}>
      <div className={`fixed inset-0 os-grid neural-pulse-bg pointer-events-none transition-opacity duration-1000 ${wallpaper === 'os-grid' ? 'opacity-10' : 'opacity-5'}`}></div>

      <main className="relative flex-1 z-10 p-4 md:p-6 h-[calc(100vh-48px)] overflow-hidden">
        <Desktop installedAppIds={installedAppIds} onIconClick={(id) => openApp(id)} />
        
        {(Object.values(windows) as WindowState[]).map(win => {
          const mod = modules.find(m => m.id === win.id);
          return win.isOpen && (
            <Window key={win.id} {...win} isActive={activeApp === win.id} onClose={() => closeApp(win.id)} onFocus={() => { setMaxZ(z => z + 1); setWindows(w => ({ ...w, [win.id]: { ...w[win.id], zIndex: maxZ + 1 } })); setActiveApp(win.id); }} onMinimize={() => setWindows(w => ({ ...w, [win.id]: { ...w[win.id], isMinimized: true } }))} onMaximize={() => setWindows(w => ({ ...w, [win.id]: { ...w[win.id], isMaximized: !w[win.id].isMaximized } }))}>
              {mod ? (
                <LearningEngineOverlay 
                  module={mod} 
                  milestone={dynamicMilestone}
                  equippedBuffs={equippedItems}
                  xpMultiplier={xpMultiplier}
                  creditBonus={creditBonus}
                  step={learningStep} 
                  currentQuizIndex={currentQuizIndex}
                  currentScore={lessonScore}
                  onClose={() => closeApp(mod.id)}
                  onNextStep={() => setLearningStep('quiz')}
                  onQuizSelect={setQuizSelection}
                  onCheckAnswer={handleCheckAnswer}
                  onNextLesson={async () => await loadLessonContent(mod)}
                  onResultClose={() => closeApp(mod.id)}
                  onTriggerFallback={handleManualFallback}
                  selectedAnswer={quizSelection}
                  feedback={quizFeedback}
                  isApiEnabled={isApiEnabled}
                />
              ) : (
                <>
                  {win.id === 'dashboard' && <Dashboard user={user} modules={modules} inventory={inventory} onLaunchQuest={openApp} onEnroll={handleEnroll} isApiEnabled={isApiEnabled} />}
                  {win.id === 'profile' && <Profile user={user} modules={modules} achievements={achievements} inventory={inventory} onUpdateUser={(u) => setUser(p => ({ ...p, ...u }))} />}
                  {win.id === 'settings' && <Settings wallpaper={wallpaper} setWallpaper={setWallpaper} focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} />}
                  {win.id === 'assistant' && <Assistant isApiEnabled={isApiEnabled} />}
                  {win.id === 'journal' && <Emotions />}
                  {win.id === 'appmanager' && <AppManager installedAppIds={installedAppIds} onInstall={(id) => setInstalledAppIds(p => [...p, id])} onUninstall={(id) => setInstalledAppIds(p => p.filter(a => a !== id))} onOpen={openApp} />}
                  {win.id === 'course-creator' && <CourseCreator onAddModule={(m) => setModules(p => [...p, m])} />}
                  {win.id === 'control-panel' && <ControlPanel focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} />}
                  {win.id === 'calendar' && <Calendar />}
                  {win.id === 'armory' && <Armory user={user} inventory={inventory} onBuy={(id) => { const item = inventory.find(i => i.id === id); if(item && user.credits >= item.cost) { setInventory(p => p.map(i => i.id === id ? { ...i, isOwned: true } : i)); setUser(u => ({ ...u, credits: u.credits - item.cost })); } }} onEquip={(id) => setInventory(p => p.map(i => i.id === id ? { ...i, isEquipped: !i.isEquipped } : i))} />}
                  {win.id === 'trophy-room' && <Achievements achievements={achievements} />}
                  {win.id === 'mindmap' && <MindMapper />}
                  {win.id === 'timer' && <FocusTimer />}
                  {win.id === 'calc' && <SmartCalc />}
                  {win.id === 'neural-stream' && <NeuralStream isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} pulseSpeed={synapticPulse} />}
                  {win.id === 'os-helper' && <OSHelper />}
                </>
              )}
            </Window>
          );
        })}

        {newBadge && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100000] animate-in slide-in-from-top duration-700">
             <div className="bg-amber-600/90 border border-amber-400 p-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center gap-6 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white border border-white/30">
                   <i className={`fas ${newBadge.icon}`}></i>
                </div>
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Trophy Room Update</h3>
                   <h2 className="text-xl font-black text-white uppercase font-orbitron">{newBadge.title}</h2>
                   <p className="text-[11px] text-white/80 font-medium">Achievement Unlocked & Synced</p>
                </div>
             </div>
          </div>
        )}

        {enrollmentSuccessTitle && (
          <div className="fixed inset-0 z-[100000] pointer-events-none flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-[#020617]/90 border-2 border-emerald-500/50 p-12 rounded-[3.5rem] shadow-[0_0_120px_rgba(16,185,129,0.3)] text-center backdrop-blur-2xl">
              <i className="fas fa-satellite-dish text-5xl text-emerald-400 animate-pulse mb-6 block"></i>
              <h2 className="text-emerald-500 uppercase tracking-[0.5em] font-orbitron text-[10px] mb-2">Neural Node Activated</h2>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-orbitron">{enrollmentSuccessTitle}</h1>
            </div>
          </div>
        )}
      </main>

      <Taskbar isApiEnabled={isApiEnabled} windows={(Object.values(windows) as WindowState[]).filter(w => w.isOpen)} activeApp={activeApp} onAppClick={openApp} onStartClick={() => setIsStartOpen(!isStartOpen)} onControlClick={() => openApp('control-panel')} onCalendarClick={() => openApp('calendar')} />
      {isStartOpen && <StartMenu installedAppIds={installedAppIds} onClose={() => setIsStartOpen(false)} onLaunch={openApp} />}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onLaunch={openApp} />
    </div>
  );
};

const LearningEngineOverlay: React.FC<{
  module: LearningModule;
  milestone: any;
  equippedBuffs: InventoryItem[];
  xpMultiplier: number;
  creditBonus: number;
  step: 'lesson' | 'loading' | 'quiz' | 'result' | 'error';
  currentQuizIndex: number;
  currentScore: number;
  onClose: () => void;
  onNextStep: () => void;
  onQuizSelect: (l: string) => void;
  onCheckAnswer: () => void;
  onNextLesson: () => void;
  onResultClose: () => void;
  onTriggerFallback: () => void;
  selectedAnswer: string | null;
  feedback: 'correct' | 'incorrect' | null;
  isApiEnabled: boolean;
}> = ({ module, milestone, equippedBuffs, xpMultiplier, creditBonus, step, currentQuizIndex, currentScore, onClose, onNextStep, onQuizSelect, onCheckAnswer, onNextLesson, onResultClose, onTriggerFallback, selectedAnswer, feedback, isApiEnabled }) => {
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const currentQuiz = milestone?.quizzes?.[currentQuizIndex];

  // Reactive fallback: If Neural Link is disabled during a synthesis step, immediately shift to archive.
  useEffect(() => {
    if (step === 'loading' && !isApiEnabled) {
      onTriggerFallback();
    }
  }, [isApiEnabled, step, onTriggerFallback]);

  useEffect(() => {
    if (step === 'loading') {
      const interval = setInterval(() => {
        setSynthesisProgress(p => p < 100 ? p + 2 : 100);
      }, isApiEnabled ? 50 : 25);
      return () => clearInterval(interval);
    } else {
      setSynthesisProgress(0);
    }
  }, [step, isApiEnabled]);

  if (step === 'loading') return (
    <div className="absolute inset-0 bg-[#020617] z-40 flex flex-col items-center justify-center text-center p-12 overflow-hidden">
      <div className="absolute inset-0 os-grid opacity-10 pointer-events-none"></div>
      <div className="w-24 h-24 md:w-32 md:h-32 relative mb-12">
        <div className={`absolute inset-0 border-4 ${isApiEnabled ? 'border-blue-500/20' : 'border-amber-500/20'} rounded-full`}></div>
        <div className={`absolute inset-0 border-4 ${isApiEnabled ? 'border-blue-500' : 'border-amber-500'} border-t-transparent rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className={`fas ${isApiEnabled ? 'fa-brain text-blue-500' : 'fa-database text-amber-500'} text-3xl md:text-4xl animate-pulse`}></i>
        </div>
      </div>
      <div className="space-y-6 max-w-md w-full px-6">
        <h3 className={`text-xl md:text-2xl font-orbitron font-black text-white uppercase tracking-widest ${!isApiEnabled ? 'text-amber-400' : ''}`}>
          {isApiEnabled ? 'Curriculum Synthesis' : 'Archive Retrieval'}
        </h3>
        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">
          {isApiEnabled ? 'Core AI Indexing Synaptic Layers...' : 'Scanning Local Cryptic Storage...'}
        </p>
        
        <div className="space-y-3">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
             <div className={`h-full transition-all duration-300 ${isApiEnabled ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`} style={{ width: `${synthesisProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest">
             <span>{isApiEnabled ? 'Assembly Stage' : 'Data Reconstruction'}</span>
             <span>{synthesisProgress}% Logged</span>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center gap-4">
          <button 
            onClick={onTriggerFallback}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all"
          >
            Engage Archive Fallback
          </button>
          <button onClick={onClose} className="text-[9px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Abort Link
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'error') return (
    <div className="absolute inset-0 bg-[#020617] z-40 flex flex-col items-center justify-center text-center p-12">
      <i className="fas fa-triangle-exclamation text-6xl text-red-500 mb-8"></i>
      <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-tighter mb-4">Neural Buffer Overload</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">Failed to synthesize curriculum. If you are in Static Mode, ensure local milestones are indexed for this node.</p>
      <button onClick={onClose} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest">Abort Link</button>
    </div>
  );

  return (
    <div className={`absolute inset-0 bg-slate-950 z-0 text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-500 ${!isApiEnabled ? 'border-l-4 border-amber-600/50' : ''}`}>
      <div className={`h-16 md:h-20 glass border-b ${isApiEnabled ? 'border-white/10' : 'border-amber-500/30'} flex items-center justify-between px-4 md:px-10 shrink-0`}>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={onClose} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-90"
            title="Return to Hub"
          >
            <i className="fas fa-arrow-left text-sm md:text-base"></i>
          </button>
          <div>
            <h3 className="text-sm md:text-xl font-black uppercase font-orbitron tracking-tight truncate max-w-[120px] xs:max-w-[150px] md:max-w-none">{module.title}</h3>
            <p className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-1 ${isApiEnabled ? 'text-blue-400' : 'text-amber-400'}`}>
              {isApiEnabled ? 'Synaptic Layer' : 'Archive Sector'} {module.lessonsFinished + 1}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          {isApiEnabled ? (
            <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-2 py-1 md:px-4 md:py-1.5 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
               <span className="text-[7px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest hidden xs:block">Neural Stream Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-600/10 border border-amber-500/20 px-2 py-1 md:px-4 md:py-1.5 rounded-full animate-pulse">
               <i className="fas fa-shield-halved text-amber-500 text-[8px] md:text-[10px]"></i>
               <span className="text-[7px] md:text-[9px] font-black text-amber-500 uppercase tracking-widest hidden xs:block">Static Archive Active</span>
            </div>
          )}
          
          <div className="hidden lg:flex items-center gap-4 px-6 border-l border-white/5 h-10">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Armory Loadout</p>
            {equippedBuffs.length > 0 ? equippedBuffs.map(buff => (
              <div key={buff.id} className={`w-9 h-9 rounded-xl ${isApiEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/5 text-slate-500'} flex items-center justify-center text-xs hover:scale-110 transition-transform cursor-help`} title={`${buff.name}: Active`}>
                <i className={`fas ${buff.icon}`}></i>
              </div>
            )) : <span className="text-[9px] text-slate-700 uppercase font-black">No Buffs</span>}
            <div className="text-right ml-4 border-l border-white/5 pl-4">
              <p className={`text-sm font-black font-orbitron leading-none ${isApiEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>x{xpMultiplier.toFixed(1)} XP</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">+{creditBonus} CRD Synergy</p>
            </div>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${isApiEnabled ? 'bg-blue-500' : 'bg-amber-500'} animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]`}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#020617] relative">
        <div className={`absolute inset-0 os-grid ${isApiEnabled ? 'opacity-[0.03]' : 'opacity-[0.015] grayscale'} pointer-events-none`}></div>
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          {step === 'lesson' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-24">
              <div className="space-y-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.5em] font-orbitron ${isApiEnabled ? 'text-blue-500' : 'text-amber-500'}`}>
                  {isApiEnabled ? 'Knowledge Node Verification' : 'Archive Data Reconstruction'}
                </p>
                <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron leading-tight">{milestone?.title}</h1>
              </div>
              
              <div className={`glass border rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-10 relative overflow-hidden group ${isApiEnabled ? 'border-white/10' : 'border-amber-500/20 bg-amber-950/5'}`}>
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 hidden md:block">
                  <i className={`fas ${isApiEnabled ? 'fa-microchip' : 'fa-box-archive'} text-[200px]`}></i>
                </div>
                <div className="prose prose-invert max-w-none text-base md:text-lg text-slate-300 leading-relaxed font-medium markdown-content">
                   {/* Simplified markdown rendering */}
                   {milestone?.content?.split('\n').map((line: string, idx: number) => {
                     if (line.startsWith('###')) return <h3 key={idx} className="text-xl font-bold text-white mt-6 mb-3 font-orbitron">{line.replace('###', '')}</h3>;
                     if (line.startsWith('*')) return <li key={idx} className="ml-4 list-disc text-slate-400 mb-1">{line.replace('*', '')}</li>;
                     if (line.match(/^\d\./)) return <li key={idx} className="ml-4 list-decimal text-slate-400 mb-1">{line}</li>;
                     return <p key={idx} className="mb-4">{line}</p>;
                   })}
                </div>
                
                {milestone?.objectives && (
                  <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {milestone?.objectives?.map((obj: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                         <i className={`fas fa-circle-check mt-1 ${isApiEnabled ? 'text-emerald-500' : 'text-amber-600'}`}></i>
                         <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{obj}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {milestone?.detailedNotes && (
                <div className={`bg-slate-900 border p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] space-y-6 ${isApiEnabled ? 'border-white/5' : 'border-amber-500/10'}`}>
                   <h3 className="text-sm font-black text-white uppercase font-orbitron tracking-widest flex items-center gap-3">
                     <i className={`fas ${isApiEnabled ? 'fa-brain text-blue-400' : 'fa-database text-amber-500'}`}></i> 
                     {isApiEnabled ? 'Synaptic Deep Dive' : 'Archival Insight'}
                   </h3>
                   <p className={`text-sm text-slate-400 leading-relaxed font-medium whitespace-pre-line border-l-2 pl-6 italic ${isApiEnabled ? 'border-blue-500/30' : 'border-amber-600/30'}`}>
                     {milestone?.detailedNotes}
                   </p>
                </div>
              )}

              <button onClick={onNextStep} className={`group w-full py-6 md:py-8 text-white font-black rounded-3xl text-lg md:text-xl font-orbitron uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 ${isApiEnabled ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'}`}>
                {isApiEnabled ? 'Commit to Neural Memory' : 'Commit to Local Cache'} <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
              </button>
            </div>
          )}

          {step === 'quiz' && currentQuiz && (
            <div className={`glass rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-16 shadow-2xl border animate-in zoom-in-95 duration-500 relative overflow-hidden ${isApiEnabled ? 'border-white/10' : 'border-amber-500/30'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className={`h-full transition-all duration-500 ${isApiEnabled ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-amber-500'}`} style={{ width: `${(currentQuizIndex / milestone.quizzes.length) * 100}%` }}></div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
                 <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] font-orbitron ${isApiEnabled ? 'text-blue-400' : 'text-amber-400'}`}>
                   {isApiEnabled ? 'Logic Verification' : 'Archive Check'}: Phase {currentQuizIndex + 1}/{milestone.quizzes.length}
                 </h3>
                 <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Mastery Multiplier: x{xpMultiplier.toFixed(1)}</span>
              </div>
              <h2 className="text-xl md:text-3xl font-black mb-8 md:mb-12 font-orbitron text-white leading-tight">{currentQuiz.question}</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4 mb-8 md:mb-12">
                {currentQuiz.options.map((opt: any) => (
                  <button key={opt.letter} disabled={!!feedback} onClick={() => onQuizSelect(opt.letter)} className={`group w-full p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 text-left text-base md:text-lg font-bold flex items-center gap-4 md:gap-6 transition-all ${selectedAnswer === opt.letter ? (isApiEnabled ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-amber-500 bg-amber-500/10 text-amber-400') : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:text-slate-300'}`}>
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black transition-all shrink-0 ${selectedAnswer === opt.letter ? (isApiEnabled ? 'bg-blue-600 text-white shadow-lg' : 'bg-amber-600 text-white') : 'bg-slate-900 text-slate-700 group-hover:bg-slate-800'}`}>{opt.letter}</div>
                    <span className="flex-1 leading-tight text-sm md:text-lg">{opt.text}</span>
                    {feedback && opt.letter === currentQuiz.correctLetter && <i className="fas fa-check-circle text-emerald-500 text-xl md:text-2xl"></i>}
                    {feedback && selectedAnswer === opt.letter && opt.letter !== currentQuiz.correctLetter && <i className="fas fa-times-circle text-rose-500 text-xl md:text-2xl"></i>}
                  </button>
                ))}
              </div>
              <button disabled={!selectedAnswer || !!feedback} onClick={onCheckAnswer} className={`w-full py-5 md:py-6 text-white font-black rounded-[1.5rem] md:rounded-[2rem] text-base md:text-lg uppercase font-orbitron shadow-2xl transition-all disabled:opacity-30 disabled:grayscale active:scale-95 ${isApiEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                {isApiEnabled ? 'Execute Logic Check' : 'Execute Archival Verification'}
              </button>
            </div>
          )}

          {step === 'result' && (
            <div className="text-center py-12 md:py-16 space-y-12 animate-in zoom-in-95 duration-500">
              <div className="relative">
                <div className={`absolute inset-0 blur-[60px] md:blur-[100px] rounded-full ${isApiEnabled ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}></div>
                <div className={`w-36 h-36 md:w-64 md:h-64 rounded-full text-white flex flex-col items-center justify-center mx-auto border-[8px] md:border-[12px] border-[#020617] shadow-2xl relative z-10 animate-[bounce_2s_infinite] ${isApiEnabled ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  <span className="text-4xl md:text-8xl font-black font-orbitron">{currentScore}</span>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-2">{isApiEnabled ? 'Sync Clear' : 'Archive Restored'}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black text-white font-orbitron uppercase tracking-tighter">{isApiEnabled ? 'Node Integrated' : 'Sector Restored'}</h2>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] md:text-[10px]">Neural Path: {module.title}</p>
                </div>
                
                <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 px-4">
                  <div className={`bg-blue-600/10 border border-blue-500/20 px-6 py-4 md:px-8 md:py-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center gap-2 group transition-all ${isApiEnabled ? 'hover:border-blue-500/50' : 'grayscale opacity-50'}`}>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">XP Allocation</p>
                    <p className="text-2xl md:text-3xl font-black text-blue-400 font-orbitron">+{Math.round(100 * xpMultiplier)}</p>
                    <p className="text-[7px] md:text-[8px] font-bold text-blue-500/60 uppercase">Base 100 + Buff Bonus</p>
                  </div>
                  <div className={`bg-emerald-600/10 border border-emerald-500/20 px-6 py-4 md:px-8 md:py-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center gap-2 group transition-all ${isApiEnabled ? 'hover:border-blue-500/50' : 'grayscale opacity-50'}`}>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Credit Yield</p>
                    <p className="text-2xl md:text-3xl font-black text-emerald-400 font-orbitron">+{50 + creditBonus}</p>
                    <p className="text-[7px] md:text-[8px] font-bold text-emerald-500/60 uppercase">Standard 50 + Buff Synergy</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-6">
                <button onClick={onNextLesson} className={`px-8 py-5 md:px-12 md:py-6 text-white font-black rounded-[2rem] md:rounded-[2.5rem] text-[10px] md:text-[11px] font-orbitron uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${isApiEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}>Advance to Next Layer</button>
                <button onClick={onResultClose} className="px-8 py-5 md:px-12 md:py-6 glass hover:bg-white/5 text-slate-400 font-black rounded-[2rem] md:rounded-[2.5rem] text-[10px] md:text-[11px] font-orbitron uppercase tracking-widest border border-white/5 transition-all">Return to Command Hub</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
