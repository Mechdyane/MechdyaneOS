
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
import BountyBoard from './pages/BountyBoard';
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
  // --- CORE STATE ---
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

  // --- SYSTEM PREFERENCES ---
  const [wallpaper, setWallpaper] = useState<string>(localStorage.getItem('mechdyane_wallpaper') || 'os-grid');
  const [focusMode, setFocusMode] = useState<boolean>(localStorage.getItem('mechdyane_focus') === 'true');
  const [synapticPulse, setSynapticPulse] = useState<number>(Number(localStorage.getItem('mechdyane_pulse')) || 1);
  const [isApiEnabled, setIsApiEnabled] = useState(() => localStorage.getItem('mechdyane_api_enabled') !== 'false');

  // --- UI STATE ---
  const [windows, setWindows] = useState<Record<AppId, WindowState>>({});
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [maxZ, setMaxZ] = useState(100);
  const [newBadge, setNewBadge] = useState<Achievement | null>(null);
  const [enrollmentSuccessTitle, setEnrollmentSuccessTitle] = useState<string | null>(null);

  // --- LEARNING ENGINE STATE ---
  const [activeLearningModuleId, setActiveLearningModuleId] = useState<string | null>(null);
  const [learningStep, setLearningStep] = useState<'lesson' | 'loading' | 'quiz' | 'result' | 'error'>('lesson');
  const [dynamicMilestone, setDynamicMilestone] = useState<any>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [lessonScore, setLessonScore] = useState(0);
  const [quizSelection, setQuizSelection] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // --- CALCULATED VALUES (BUFFS) ---
  const equippedItems = useMemo(() => inventory.filter(i => i.isEquipped), [inventory]);
  const xpMultiplier = useMemo(() => equippedItems.some(i => i.name === 'Logic Core') ? 1.1 : 1.0, [equippedItems]);
  const creditBonus = useMemo(() => equippedItems.some(i => i.name === 'Cyber Lens') ? 5 : 0, [equippedItems]);

  const activeLearningModule = useMemo(() => 
    modules.find(m => m.id === activeLearningModuleId), 
    [modules, activeLearningModuleId]
  );

  const isAnyWindowMaximized = useMemo(() => {
    return (Object.values(windows) as WindowState[]).some(w => w.isOpen && w.isMaximized && !w.isMinimized);
  }, [windows]);

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('mechdyane_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('mechdyane_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('mechdyane_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('mechdyane_modules', JSON.stringify(modules)); }, [modules]);
  useEffect(() => { localStorage.setItem('mechdyane_claimed_bounties', JSON.stringify(claimedBountyIds)); }, [claimedBountyIds]);
  useEffect(() => { localStorage.setItem('mechdyane_api_enabled', String(isApiEnabled)); }, [isApiEnabled]);
  useEffect(() => { localStorage.setItem('mechdyane_wallpaper', wallpaper); }, [wallpaper]);
  useEffect(() => { localStorage.setItem('mechdyane_focus', String(focusMode)); }, [focusMode]);
  useEffect(() => { localStorage.setItem('mechdyane_pulse', String(synapticPulse)); }, [synapticPulse]);

  // --- ACHIEVEMENTS LOGIC ---
  const checkAchievements = (updatedUser: UserState, updatedModules: LearningModule[]) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.isUnlocked) return ach;
      let progress = ach.progress;
      let isUnlocked = false;

      if (ach.id === 'steady-flow') progress = updatedUser.streak;
      else if (ach.id === 'polymath') progress = updatedModules.filter(m => m.progress >= 100).length;
      else if (ach.id === 'deep-dive') {
        const maxLessons = Math.max(...updatedModules.map(m => m.lessonsFinished));
        if (maxLessons >= 10) progress = 1;
      }

      if (progress >= ach.target) {
        isUnlocked = true;
        setNewBadge(ach);
        setTimeout(() => setNewBadge(null), 5000);
      }
      return { ...ach, progress, isUnlocked };
    }));
  };

  // --- LEARNING HANDLERS ---
  const loadLessonContent = async (mod: LearningModule) => {
    setCurrentQuizIndex(0);
    setLessonScore(0);
    setLearningStep('loading');
    
    if (!isApiEnabled) {
      setTimeout(() => {
        const localMilestone = mod.milestones[mod.lessonsFinished];
        if (localMilestone) { setDynamicMilestone(localMilestone); setLearningStep('lesson'); }
        else { setLearningStep('error'); }
      }, 1500);
      return;
    }

    try {
        const dynamicData = await generateDynamicLessonContent(mod.title, mod.lessonsFinished + 1, user.level);
        if (dynamicData) { setDynamicMilestone(dynamicData); setLearningStep('lesson'); }
        else { throw new Error("Empty Response"); }
    } catch (e) {
        const localFallback = mod.milestones[mod.lessonsFinished];
        if (localFallback) { setDynamicMilestone(localFallback); setLearningStep('lesson'); }
        else { setLearningStep('error'); }
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
          const updatedModules = modules.map(m => m.id === activeLearningModule.id ? { ...m, lessonsFinished: nextLessonsFinished, progress: nextProgress } : m);
          setModules(updatedModules);
          
          const earnedXp = Math.round(100 * xpMultiplier);
          const earnedCredits = 50 + creditBonus;
          
          setUser(prev => {
            const nextXp = prev.xp + earnedXp;
            const nextLevel = Math.floor(nextXp / 1000) + 1;
            const updatedUser = { ...prev, xp: nextXp, level: nextLevel, credits: prev.credits + earnedCredits, lessonsFinished: prev.lessonsFinished + 1 };
            checkAchievements(updatedUser, updatedModules);
            return updatedUser;
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

  // --- APP LIFECYCLE ---
  const openApp = async (id: AppId, title?: string, icon?: string) => {
    const existing = windows[id];
    const newZ = maxZ + 1;
    setMaxZ(newZ);

    // Standard OS Behavior Logic
    if (existing && existing.isOpen) {
      // If window is active and NOT minimized, clicking again minimizes it
      if (activeApp === id && !existing.isMinimized) {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
        setActiveApp(null);
        return;
      }
      // Otherwise, restore and focus
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: false, zIndex: newZ } }));
      setActiveApp(id);
      return;
    }

    // Initialize new app or learning module
    let mod = modules.find(m => m.id === id);
    if (mod) {
      setActiveLearningModuleId(mod.id);
      setActiveApp(mod.id);
      setWindows(prev => ({
        ...prev,
        [id]: { id, title: mod.title, icon: mod.icon, isOpen: true, isMinimized: false, isMaximized: false, zIndex: newZ }
      }));
      await loadLessonContent(mod);
    } else {
      setWindows(prev => ({
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
      }));
      setActiveApp(id);
    }
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

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMaximized: !prev[id].isMaximized } }));
    setActiveApp(id);
  };

  const focusApp = (id: AppId) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ, isMinimized: false } }));
    setActiveApp(id);
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

  const handleClaimBounty = (xp: number, credits: number, bountyId: string) => {
    const finalXp = Math.round(xp * xpMultiplier);
    const finalCredits = credits + creditBonus;

    setClaimedBountyIds(prev => [...prev, bountyId]);
    setUser(prev => {
        const nextXp = prev.xp + finalXp;
        const nextLevel = Math.floor(nextXp / 1000) + 1;
        const updatedUser = { ...prev, xp: nextXp, credits: prev.credits + finalCredits, level: nextLevel };
        checkAchievements(updatedUser, modules);
        return updatedUser;
    });
  };

  return (
    <div className={`h-screen w-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden transition-all duration-1000 ${focusMode ? 'grayscale-[0.6] brightness-[0.7] sepia-[0.1]' : ''}`}>
      <Sidebar onLaunch={openApp} user={user} activeApp={activeApp} isHidden={isAnyWindowMaximized} />
      <div className="flex-1 flex flex-col relative h-full">
        <main className="relative flex-1 z-10 p-2 md:p-6 h-[calc(100vh-56px)] overflow-hidden">
          <Desktop installedAppIds={installedAppIds} onIconClick={openApp} />
          
          {(Object.values(windows) as WindowState[]).map(win => {
            const mod = modules.find(m => m.id === win.id);
            return win.isOpen && (
              <Window 
                key={win.id} 
                {...win} 
                isActive={activeApp === win.id} 
                onClose={() => closeApp(win.id)} 
                onFocus={() => focusApp(win.id)} 
                onMinimize={() => minimizeApp(win.id)} 
                onMaximize={() => toggleMaximize(win.id)}
              >
                {mod ? (
                  <LearningEngineOverlay 
                    module={mod} 
                    milestone={dynamicMilestone} 
                    step={learningStep} 
                    currentQuizIndex={currentQuizIndex} 
                    currentScore={lessonScore} 
                    onClose={() => closeApp(mod.id)} 
                    onNextStep={() => setLearningStep('quiz')} 
                    onQuizSelect={setQuizSelection} 
                    onCheckAnswer={handleCheckAnswer} 
                    onNextLesson={async () => await loadLessonContent(mod)} 
                    onResultClose={() => closeApp(mod.id)} 
                    selectedAnswer={quizSelection} 
                    feedback={quizFeedback} 
                    isApiEnabled={isApiEnabled} 
                  />
                ) : (
                  <>
                    {win.id === 'dashboard' && <Dashboard user={user} modules={modules} inventory={inventory} onLaunchQuest={openApp} onEnroll={handleEnroll} isApiEnabled={isApiEnabled} />}
                    {win.id === 'profile' && <Profile user={user} modules={modules} achievements={achievements} inventory={inventory} onUpdateUser={(u) => setUser(p => ({ ...p, ...u }))} />}
                    {win.id === 'armory' && <Armory user={user} inventory={inventory} onBuy={(id) => { const item = inventory.find(i => i.id === id); if(item && user.credits >= item.cost) { setInventory(p => p.map(i => i.id === id ? { ...i, isOwned: true } : i)); setUser(u => ({ ...u, credits: u.credits - item.cost })); } }} onEquip={(id) => setInventory(p => p.map(i => i.id === id ? { ...i, isEquipped: !i.isEquipped } : i))} />}
                    {win.id === 'trophy-room' && <Achievements achievements={achievements} user={user} modules={modules} />}
                    {win.id === 'bounty-board' && <BountyBoard user={user} modules={modules} claimedIds={claimedBountyIds} onClaim={handleClaimBounty} isApiEnabled={isApiEnabled} />}
                    {win.id === 'control-panel' && <ControlPanel focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} />}
                    {win.id === 'settings' && <Settings wallpaper={wallpaper} setWallpaper={setWallpaper} focusMode={focusMode} setFocusMode={setFocusMode} pulseSpeed={synapticPulse} setPulseSpeed={setSynapticPulse} />}
                    {win.id === 'assistant' && <Assistant isApiEnabled={isApiEnabled} />}
                    {win.id === 'neural-stream' && <NeuralStream isApiEnabled={isApiEnabled} setIsApiEnabled={setIsApiEnabled} pulseSpeed={synapticPulse} />}
                    {win.id === 'mindmap' && <MindMapper />}
                    {win.id === 'timer' && <FocusTimer />}
                    {win.id === 'calc' && <SmartCalc />}
                    {win.id === 'journal' && <Emotions />}
                    {win.id === 'appmanager' && <AppManager installedAppIds={installedAppIds} onInstall={(id) => setInstalledAppIds(p => [...p, id])} onUninstall={(id) => setInstalledAppIds(p => p.filter(a => a !== id))} onOpen={openApp} />}
                    {win.id === 'course-creator' && <CourseCreator onAddModule={(m) => setModules(p => [...p, m])} />}
                    {win.id === 'calendar' && <Calendar />}
                    {win.id === 'os-helper' && <OSHelper />}
                  </>
                )}
              </Window>
            );
          })}

          {newBadge && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100000] animate-in slide-in-from-top duration-700">
               <div className="bg-amber-600/90 border-2 border-amber-400 p-6 rounded-[2.5rem] shadow-[0_0_80px_rgba(245,158,11,0.4)] flex items-center gap-8 backdrop-blur-2xl">
                  <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl text-white border border-white/30 shadow-2xl">
                     <i className={`fas ${newBadge.icon}`}></i>
                  </div>
                  <div className="pr-6">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/70 mb-2 font-orbitron">Neural Milestone Verified</h3>
                     <h2 className="text-2xl font-black text-white uppercase font-orbitron tracking-tight">{newBadge.title}</h2>
                     <p className="text-[10px] font-bold text-amber-100/60 uppercase tracking-widest mt-1">Synchronizing with Global Trophy Room...</p>
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

// --- LEARNING OVERLAY HELPER ---
interface LearningEngineOverlayProps {
  module: LearningModule; milestone: any; step: 'lesson' | 'loading' | 'quiz' | 'result' | 'error'; currentQuizIndex: number; currentScore: number; onClose: () => void; onNextStep: () => void; onQuizSelect: (val: string) => void; onCheckAnswer: () => void; onNextLesson: () => void; onResultClose: () => void; selectedAnswer: string | null; feedback: 'correct' | 'incorrect' | null; isApiEnabled: boolean;
}
const LearningEngineOverlay: React.FC<LearningEngineOverlayProps> = ({ module, milestone, step, currentQuizIndex, currentScore, onClose, onNextStep, onQuizSelect, onCheckAnswer, onNextLesson, onResultClose, selectedAnswer, feedback, isApiEnabled }) => {
  if (step === 'loading') return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-[#020617]/80 text-center backdrop-blur-xl">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-[6px] border-blue-500/20 border-t-blue-500 animate-spin"></div>
        <i className="fas fa-brain absolute inset-0 flex items-center justify-center text-3xl text-blue-400 animate-pulse"></i>
      </div>
      <h3 className="text-2xl font-black text-white font-orbitron uppercase tracking-tighter">Neural Synthesis</h3>
      <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-[0.4em] mt-3 animate-pulse">Hydrating Knowledge Node {module.lessonsFinished + 1} of 12</p>
    </div>
  );
  
  if (step === 'lesson') return (
    <div className="h-full flex flex-col bg-[#020617]/60">
      <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron">Layer {module.lessonsFinished + 1}</span>
             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Mastery Status: Awaiting Verification</span>
          </div>
          <h1 className="text-5xl font-black text-white font-orbitron uppercase tracking-tighter leading-none">{milestone?.title}</h1>
        </header>
        
        <div className="bg-slate-900/60 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative">
           <div className="absolute top-6 right-10 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] font-orbitron">Cognitive Brief</div>
           <div className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
             {milestone?.content}
           </div>
        </div>

        <div className="bg-blue-600/[0.03] border border-blue-500/20 p-10 rounded-[2.5rem] space-y-6">
           <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] font-orbitron flex items-center gap-3">
             <i className="fas fa-info-circle"></i> Technical Deep Dive
           </h4>
           <div className="text-slate-400 text-sm leading-relaxed italic whitespace-pre-wrap">
             {milestone?.detailedNotes}
           </div>
        </div>
      </div>
      <div className="p-10 bg-slate-900/80 border-t border-white/10 flex justify-end gap-6 backdrop-blur-xl">
        <button onClick={onClose} className="px-10 py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all">Abort Link</button>
        <button onClick={onNextStep} className="px-14 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] uppercase font-black tracking-widest shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all font-orbitron">Initiate Verification</button>
      </div>
    </div>
  );

  if (step === 'quiz') {
    const q = milestone?.quizzes?.[currentQuizIndex];
    if (!q) return null;
    return (
      <div className="h-full flex flex-col bg-[#020617]/60">
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-12">
           <header className="text-center space-y-4">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] font-orbitron">Verification Step {currentQuizIndex + 1}/5</p>
              <h2 className="text-3xl font-black text-white font-orbitron uppercase text-center max-w-3xl tracking-tight leading-tight">{q.question}</h2>
           </header>
           
           <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
              {q.options.map((opt: any) => (
                <button 
                  key={opt.letter} 
                  onClick={() => onQuizSelect(opt.letter)} 
                  disabled={!!feedback}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-8 group/opt ${
                    selectedAnswer === opt.letter 
                      ? (feedback === 'correct' ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : (feedback === 'incorrect' ? 'bg-red-600/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-blue-600 border-blue-500 text-white shadow-xl')) 
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black font-orbitron text-lg transition-colors ${selectedAnswer === opt.letter ? 'bg-white/20' : 'bg-white/5 group-hover/opt:bg-white/10'}`}>
                    {opt.letter}
                  </div>
                  <span className="text-base font-bold tracking-tight">{opt.text}</span>
                </button>
              ))}
           </div>
        </div>
        <div className="p-10 bg-slate-900/80 border-t border-white/10 flex justify-center backdrop-blur-xl">
           <button 
             onClick={onCheckAnswer} 
             disabled={!selectedAnswer || !!feedback} 
             className="px-24 py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-3xl text-xs font-black uppercase tracking-widest font-orbitron shadow-2xl transition-all"
           >
             Lock Entry Pattern
           </button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const passed = currentScore >= 4;
    return (
      <div className="h-full flex items-center justify-center bg-[#020617]/80 backdrop-blur-3xl">
        <div className="bg-slate-900/80 p-16 rounded-[3.5rem] border-2 border-white/10 text-center space-y-10 max-w-xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute inset-0 os-grid opacity-5 pointer-events-none"></div>
          
          <div className={`w-32 h-32 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl text-white shadow-2xl relative z-10 ${passed ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-red-600 shadow-red-500/40'}`}>
            <i className={`fas ${passed ? 'fa-shield-check' : 'fa-skull-crossbones'}`}></i>
          </div>

          <div className="space-y-4 relative z-10">
             <h1 className="text-5xl font-black text-white font-orbitron uppercase tracking-tighter">
               {passed ? 'Link Verified' : 'Neural Rejection'}
             </h1>
             <div className="flex flex-col items-center">
                <p className="text-slate-500 uppercase font-black text-[10px] tracking-[0.5em] mb-2">Mastery Accuracy Level</p>
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className={`w-4 h-4 rounded-full border-2 ${i <= currentScore ? (passed ? 'bg-emerald-500 border-emerald-400' : 'bg-red-500 border-red-400') : 'bg-slate-800 border-white/5'}`}></div>
                   ))}
                </div>
                <p className="text-2xl font-black text-white font-orbitron mt-4">{currentScore} / 5</p>
             </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
             <button 
               onClick={passed ? onNextLesson : onClose} 
               className={`w-full py-6 text-white rounded-2xl font-black text-xs uppercase tracking-widest font-orbitron shadow-2xl transition-all hover:scale-105 active:scale-95 ${passed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
             >
               {passed ? 'Initialize Next Layer' : 'Attempt Recalibration'}
             </button>
             <button onClick={onResultClose} className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-colors font-orbitron">Return to Hub</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default App;
