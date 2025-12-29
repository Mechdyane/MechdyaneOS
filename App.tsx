
import React, { useState, useEffect, useMemo } from 'react';
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
  useEffect(() => {
    localStorage.setItem('mechdyane_wallpaper', wallpaper);
  }, [wallpaper]);
  useEffect(() => {
    localStorage.setItem('mechdyane_focus', String(focusMode));
  }, [focusMode]);
  useEffect(() => {
    localStorage.setItem('mechdyane_pulse', String(synapticPulse));
  }, [synapticPulse]);

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
            isMaximized: false,
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

  const minimizeApp = (id: AppId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
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
    <div className={`h-screen w-screen bg-[#020617] text-slate-100 flex flex-row font-sans overflow-hidden transition-all duration-1000 ${focusMode ? 'grayscale-[0.6] brightness-[0.7] sepia-[0.1]' : ''} ${!isApiEnabled ? 'saturate-[0.8] contrast-[1.05]' : ''}`}>
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {wallpaper !== 'os-grid' && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-20"
            style={{ backgroundImage: `url(${wallpaper})`, filter: focusMode ? 'blur(10px) brightness(0.5)' : 'none' }}
          />
        )}
        <div className={`absolute inset-0 os-grid neural-pulse-bg transition-opacity duration-1000 ${wallpaper === 'os-grid' ? 'opacity-20' : 'opacity-10'}`}></div>
      </div>

      <Sidebar onLaunch={openApp} user={user} activeApp={activeApp} />

      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
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

        <Taskbar 
          isApiEnabled={isApiEnabled} 
          windows={(Object.values(windows) as WindowState[]).filter(w => w.isOpen)} 
          activeApp={activeApp} 
          onAppClick={openApp} 
          onCloseApp={closeApp}
          onMinimizeApp={minimizeApp}
          onStartClick={() => setIsStartOpen(!isStartOpen)} 
          onControlClick={() => openApp('control-panel')} 
          onCalendarClick={() => openApp('calendar')} 
        />
        {isStartOpen && <StartMenu installedAppIds={installedAppIds} onClose={() => setIsStartOpen(false)} onLaunch={openApp} />}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onLaunch={openApp} />
      </div>
    </div>
  );
};

// @google/genai Coding Guidelines: This component handles the rendering of AI-generated content and assessment logic.
interface LearningEngineOverlayProps {
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
  onQuizSelect: (val: string) => void;
  onCheckAnswer: () => void;
  onNextLesson: () => void;
  onResultClose: () => void;
  onTriggerFallback: () => void;
  selectedAnswer: string | null;
  feedback: 'correct' | 'incorrect' | null;
  isApiEnabled: boolean;
}

const LearningEngineOverlay: React.FC<LearningEngineOverlayProps> = ({
  module, milestone, equippedBuffs, xpMultiplier, creditBonus, step, currentQuizIndex, currentScore, 
  onClose, onNextStep, onQuizSelect, onCheckAnswer, onNextLesson, onResultClose, onTriggerFallback,
  selectedAnswer, feedback, isApiEnabled
}) => {
  if (step === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-8 bg-[#020617]/80 backdrop-blur-xl">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <i className="fas fa-brain absolute inset-0 flex items-center justify-center text-2xl text-blue-400 animate-pulse"></i>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter font-orbitron">Neural Synthesis in Progress</h3>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] animate-pulse">Hydrating Knowledge Node {module.lessonsFinished + 1}/12</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20">
          <i className="fas fa-triangle-exclamation text-3xl"></i>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter font-orbitron">Synaptic Fragmentation</h3>
        <div className="flex gap-4">
          <button onClick={onTriggerFallback} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">Manual Link</button>
          <button onClick={onClose} className="px-8 py-3 bg-white/5 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest border border-white/5">Abort</button>
        </div>
      </div>
    );
  }

  if (step === 'lesson') {
    return (
      <div className="h-full flex flex-col bg-[#020617]/60">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-10 pb-32">
          <header className="space-y-4">
            <span className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">
              Layer {module.lessonsFinished + 1} of 12
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-orbitron">
              {milestone?.title || 'Knowledge Acquisition'}
            </h1>
          </header>
          <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] font-orbitron flex items-center gap-3">
              <i className="fas fa-bullseye"></i> Objectives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {milestone?.objectives?.map((obj: string, i: number) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                  <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {milestone?.content}
          </div>
          <div className="bg-[#0f172a] border border-blue-500/20 p-8 rounded-[2.5rem] space-y-6">
             <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] font-orbitron">Deep Dive</h3>
             <div className="text-slate-400 text-sm leading-relaxed italic whitespace-pre-wrap font-medium">
                {milestone?.detailedNotes}
             </div>
          </div>
        </div>
        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex justify-end gap-4 sticky bottom-0">
           <button onClick={onClose} className="px-10 py-4 bg-white/5 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-white/5">Abort</button>
           <button onClick={onNextStep} className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all font-orbitron">
              Verify Mastery
           </button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const currentQuiz = milestone?.quizzes?.[currentQuizIndex];
    if (!currentQuiz) return null;
    return (
      <div className="h-full flex flex-col bg-[#020617]/60">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-10">
            <header className="text-center space-y-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] font-orbitron">Layer Verification</p>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter font-orbitron leading-tight">
                {currentQuiz.question}
              </h2>
            </header>
            <div className="grid grid-cols-1 gap-4">
              {currentQuiz.options.map((opt: any) => (
                <button
                  key={opt.letter}
                  onClick={() => onQuizSelect(opt.letter)}
                  disabled={!!feedback}
                  className={`
                    w-full flex items-center gap-6 p-6 rounded-[2rem] border transition-all text-left
                    ${selectedAnswer === opt.letter 
                      ? (feedback === 'correct' ? 'bg-emerald-600/20 border-emerald-500' : (feedback === 'incorrect' ? 'bg-red-600/20 border-red-500' : 'bg-blue-600 border-blue-500 text-white')) 
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'}
                  `}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black font-orbitron">{opt.letter}</div>
                  <span className="text-sm font-bold">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex justify-center">
           <button onClick={onCheckAnswer} disabled={!selectedAnswer || !!feedback} className="w-full max-w-sm py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-3xl text-xs uppercase tracking-widest font-orbitron">
             Lock In Entry
           </button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const passed = currentScore >= 4;
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="w-full max-w-xl bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-12 text-center space-y-10">
          <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-4xl ${passed ? 'bg-emerald-600' : 'bg-red-600'} text-white shadow-2xl`}>
             <i className={`fas ${passed ? 'fa-medal' : 'fa-skull'}`}></i>
          </div>
          <div className="space-y-2">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-orbitron">{passed ? 'Mastery Verified' : 'Rejection'}</h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Score: {currentScore} / 5</p>
          </div>
          <div className="flex flex-col gap-4">
             <button onClick={onNextLesson} className={`w-full py-5 ${passed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl font-orbitron`}>
               {passed ? 'Advance Layer' : 'Retry Verification'}
             </button>
             <button onClick={onResultClose} className="text-[9px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-widest">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* Added default export to fix "module has no default export" error in index.tsx */
export default App;
