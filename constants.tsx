
import { ModuleCategory, LearningModule, SoftwareApp, LeaderboardEntry, Milestone, Achievement, InventoryItem } from './types';

export const INITIAL_USER = {
  name: "Explorer_082",
  avatar: "",
  institution: "Mechdyane Central Academy",
  specialization: "General Intelligence",
  bio: "Establishing first neural link with the OS environment.",
  level: 1,
  xp: 150,
  credits: 500,
  streak: 1,
  lessonsFinished: 0,
  activeModuleId: 'ict-office'
};

const createLevels = (courseId: string, levelThemes: string[], category: ModuleCategory): Milestone[] => {
  return levelThemes.map((theme, i) => {
    const isIntro = i === 0;
    const notes = isIntro 
      ? `### Knowledge Node Activation: ${theme}\n\nYou have initialized the primary layer of this Knowledge Node. This entry establishes the foundational logic required for further progression.\n\n### Core Principles\n* **Structure**: Learning follows a modular sequence.\n* **Mastery**: Verification is required to unlock subsequent nodes.\n* **Integration**: Knowledge is synthesized across levels.\n\n### System Logic\nThink of this layer as the **Boot Sequence** of an operating system. Without these initial checks, the complex software of high-level mastery cannot run safely.`
      : `### Synaptic Expansion: ${theme}\n\nAdvancing to Layer ${i + 1}. We are now expanding the neural pathways established in the previous sectors.\n\n### Technical Overview\n${theme} represents a critical junction in the ${category} framework. By mastering this node, you increase your cognitive throughput and efficiency.\n\n### Key Mechanics\n1. **Observation**: Notice the patterns in ${theme}.\n2. **Application**: Practice the core skills.\n3. **Validation**: Prove your knowledge through the assessment.\n\n### The Analogy\nThis stage is like **Upgrading your Processor**. You are not just learning more; you are learning how to process information faster and more accurately.`;

    const detailedNotes = `### Advanced Neural Insights: ${theme}\n\nAnalyzing ${theme} through the lens of Mechdyane Dynamics:\n\n**Theoretical Deep Dive:**\nThis level challenges the standard heuristic by forcing the learner to integrate disparate data points into a cohesive mental model. In a live OS environment, this would trigger a memory-buffering event where old information is re-indexed alongside new discoveries.\n\n**Synaptic Summary:**\n* **Input**: Foundational concepts in ${category}.\n* **Process**: Cognitive synthesis via interactive challenges.\n* **Output**: Verified competency and XP accrual.`;

    return {
      id: `${courseId}-l${i + 1}`,
      title: theme,
      xp: 100,
      isCompleted: false,
      content: notes,
      detailedNotes: detailedNotes,
      quizzes: [
        {
          question: `What is the primary function of this '${theme}' node?`,
          options: [
            { letter: 'A', text: 'To provide a static placeholder' },
            { letter: 'B', text: 'To establish foundational logic and mastery' },
            { letter: 'C', text: 'To bypass the learning sequence' },
            { letter: 'D', text: 'To decrease cognitive load' }
          ],
          correctLetter: 'B'
        },
        {
          question: `According to the Mechdyane framework, what is 'Mastery'?`,
          options: [
            { letter: 'A', text: 'Finishing the lesson as fast as possible' },
            { letter: 'B', text: 'The ability to apply skills with precision' },
            { letter: 'C', text: 'Downloading information without verification' },
            { letter: 'D', text: 'Skipping levels' }
          ],
          correctLetter: 'B'
        },
        {
          question: `Why is the 'Boot Sequence' analogy used for Level 1?`,
          options: [
            { letter: 'A', text: 'Because learning is slow' },
            { letter: 'B', text: 'Because foundational checks are required for stability' },
            { letter: 'C', text: 'Because computers are better at learning' },
            { letter: 'D', text: 'It has no meaning' }
          ],
          correctLetter: 'B'
        },
        {
          question: `In Mechdyane OS, how are levels structured?`,
          options: [
            { letter: 'A', text: 'Randomly assigned topics' },
            { letter: 'B', text: 'A modular, sequential architecture' },
            { letter: 'C', text: 'A single giant document' },
            { letter: 'D', text: 'They are not structured' }
          ],
          correctLetter: 'B'
        },
        {
          question: `What should an explorer do if they find Level ${i + 1} challenging?`,
          options: [
            { letter: 'A', text: 'Abort the OS' },
            { letter: 'B', text: 'Embrace the friction; it indicates neural growth' },
            { letter: 'C', text: 'Wait for the system to change' },
            { letter: 'D', text: 'Delete the module' }
          ],
          correctLetter: 'B'
        }
      ]
    };
  });
};

const D_LVLS = ['Initiation', 'Logic Layer', 'Systems', 'Interaction', 'Dynamics', 'Aesthetics', 'Integration', 'Synthesis', 'Application', 'Verification', 'Mastery', 'Ascension'];

export const MODULES: LearningModule[] = [
  // --- COMPUTER SCIENCE & IT (EXPANDED) ---
  {
    id: 'ict-office',
    title: 'Computer Studies: Office Suite',
    description: 'Mastery of Word, Excel, and PowerPoint for professional productivity.',
    icon: 'fa-file-invoice',
    color: 'bg-emerald-600',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Foundational',
    objectives: ['Master document formatting.', 'Understand spreadsheet formulas.', 'Design impactful presentations.'],
    outline: D_LVLS,
    milestones: createLevels('office', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-excel-adv',
    title: 'Advanced Spreadsheet Logic',
    description: 'Deep dive into data analysis, pivot tables, and VBA automation.',
    icon: 'fa-table-cells',
    color: 'bg-green-700',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Analytical',
    objectives: ['Analyze complex datasets.', 'Build automated dashboards.', 'Master logical functions.'],
    outline: D_LVLS,
    milestones: createLevels('excel', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-digital-lit',
    title: 'Digital Literacy & Safety',
    description: 'Navigating the digital world securely and ethically.',
    icon: 'fa-user-shield',
    color: 'bg-blue-500',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Essential',
    objectives: ['Understand online privacy.', 'Identify digital threats.', 'Master ethical communication.'],
    outline: D_LVLS,
    milestones: createLevels('digi-lit', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-intro-cs',
    title: 'Intro to Computer Science',
    description: 'The mathematical and logical foundations of modern computing.',
    icon: 'fa-microchip',
    color: 'bg-indigo-800',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Academic',
    objectives: ['Understand binary logic.', 'Learn basic hardware architecture.', 'Master computational thinking.'],
    outline: D_LVLS,
    milestones: createLevels('cs-intro', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-programming',
    title: 'Programming Fundamentals',
    description: 'Learn to speak the languages of machines using Python and JavaScript.',
    icon: 'fa-code',
    color: 'bg-amber-600',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Practical',
    objectives: ['Master control flow.', 'Understand variables/types.', 'Build functional apps.'],
    outline: D_LVLS,
    milestones: createLevels('prog', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-web-dev',
    title: 'Full-Stack Web Development',
    description: 'Design and deploy modern, responsive web architectures.',
    icon: 'fa-globe',
    color: 'bg-cyan-600',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'High-Tech',
    objectives: ['Master HTML/CSS/JS.', 'Understand React/Next.js.', 'Deploy scalable backends.'],
    outline: D_LVLS,
    milestones: createLevels('web', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-networks',
    title: 'Computer Networks',
    description: 'How data travels across the globe. TCP/IP, OSI, and Routing.',
    icon: 'fa-network-wired',
    color: 'bg-slate-700',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Infrastructure',
    objectives: ['Configure network nodes.', 'Understand routing protocols.', 'Secure data transit.'],
    outline: D_LVLS,
    milestones: createLevels('net', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },
  {
    id: 'ict-dbms',
    title: 'Database Systems (SQL)',
    description: 'Designing and managing robust data storage architectures.',
    icon: 'fa-database',
    color: 'bg-rose-700',
    category: ModuleCategory.COMPUTER_SCIENCE,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Architectural',
    objectives: ['Write optimized SQL queries.', 'Design schema relations.', 'Manage data integrity.'],
    outline: D_LVLS,
    milestones: createLevels('db', D_LVLS, ModuleCategory.COMPUTER_SCIENCE)
  },

  // --- BUSINESS & ECONOMICS ---
  {
    id: 'biz-macro',
    title: 'Principles of Macroeconomics',
    description: 'Study national and global economies, including GDP, inflation, and fiscal policy.',
    icon: 'fa-chart-area',
    color: 'bg-orange-600',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Analytical',
    objectives: ['Understand economic indicators.', 'Analyze fiscal and monetary policy.', 'Evaluate global trade impacts.'],
    outline: D_LVLS,
    milestones: createLevels('macro', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },
  {
    id: 'biz-micro',
    title: 'Principles of Microeconomics',
    description: 'Behavioral choices of individuals and firms, supply and demand, and market structures.',
    icon: 'fa-magnifying-glass-chart',
    color: 'bg-amber-600',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Theoretical',
    objectives: ['Master supply and demand logic.', 'Understand consumer theory.', 'Analyze market competition.'],
    outline: D_LVLS,
    milestones: createLevels('micro', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },
  {
    id: 'biz-accounting',
    title: 'Financial Accounting',
    description: 'The language of business. Record-keeping, balance sheets, and financial health analysis.',
    icon: 'fa-calculator',
    color: 'bg-yellow-700',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Precise',
    objectives: ['Prepare financial statements.', 'Analyze cash flow.', 'Perform double-entry bookkeeping.'],
    outline: D_LVLS,
    milestones: createLevels('accounting', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },
  {
    id: 'biz-finance',
    title: 'Corporate Finance',
    description: 'Strategic management of money, assets, and capital markets.',
    icon: 'fa-money-bill-trend-up',
    color: 'bg-emerald-700',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Managerial',
    objectives: ['Understand time value of money.', 'Perform capital budgeting.', 'Manage risk and return.'],
    outline: D_LVLS,
    milestones: createLevels('finance', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },
  {
    id: 'biz-strategy',
    title: 'Strategic Management',
    description: 'Competitive advantage, business modeling, and long-term organizational planning.',
    icon: 'fa-chess',
    color: 'bg-blue-900',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Strategic',
    objectives: ['Develop SWOT analyses.', 'Identify competitive advantages.', 'Formulate growth strategies.'],
    outline: D_LVLS,
    milestones: createLevels('strategy', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },
  {
    id: 'biz-marketing',
    title: 'Marketing & Consumer Behavior',
    description: 'Decoding the human element of commerce. Branding, positioning, and digital reach.',
    icon: 'fa-bullhorn',
    color: 'bg-pink-700',
    category: ModuleCategory.BUSINESS_ECONOMICS,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Psychological',
    objectives: ['Design marketing mixes.', 'Analyze consumer psychology.', 'Execute digital campaigns.'],
    outline: D_LVLS,
    milestones: createLevels('marketing', D_LVLS, ModuleCategory.BUSINESS_ECONOMICS)
  },

  // --- BEHAVIOR & GAMIFICATION ---
  {
    id: 'gamify-intro',
    title: 'Intro to Gamification',
    description: 'Learn the core principles of using game mechanics to drive real-world engagement.',
    icon: 'fa-gamepad',
    color: 'bg-blue-600',
    category: ModuleCategory.BEHAVIOR_GAMIFICATION,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Foundational',
    objectives: ['Define core gamification pillars.', 'Understand reward schedules.', 'Apply mechanics to tasks.'],
    outline: D_LVLS,
    milestones: createLevels('gamify-intro', D_LVLS, ModuleCategory.BEHAVIOR_GAMIFICATION)
  },

  // --- THEOLOGY & MINISTRY ---
  {
    id: 'theology-systematic',
    title: 'Systematic Theology',
    description: 'Organizing religious truths into a coherent, logical system of thought.',
    icon: 'fa-scroll',
    color: 'bg-amber-900',
    category: ModuleCategory.THEOLOGY_MINISTRY,
    progress: 0,
    lessonsFinished: 0,
    totalLessons: 12,
    difficulty: 'Theological',
    objectives: ['Analyze dogmatic logic.', 'Understand historical context.', 'Synthesize beliefs.'],
    outline: D_LVLS,
    milestones: createLevels('theo-sys', D_LVLS, ModuleCategory.THEOLOGY_MINISTRY)
  }
];

export const SOFTWARE_CATALOG: SoftwareApp[] = [
  { id: 'dashboard', name: 'Operational Hub', icon: 'fa-user-graduate', description: 'Central growth command center.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'profile', name: 'Explorer Profile', icon: 'fa-user-circle', description: 'View neural identity and statistics.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'os-helper', name: 'Mechdyane Manual', icon: 'fa-circle-info', description: 'Comprehensive guide to the Mechdyane ecosystem.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'appmanager', name: 'Knowledge Ecosystem', icon: 'fa-th-large', description: 'Initialize new knowledge nodes & learning utilities.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'course-creator', name: 'Tutor Hub', icon: 'fa-chalkboard-user', description: 'Create and deploy new Knowledge Nodes.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'assistant', name: 'Mechdyane Core AI', icon: 'fa-robot', description: 'Synaptic Assistant & System Support.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'settings', name: 'System Settings', icon: 'fa-cog', description: 'Mechdyane OS configuration.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'control-panel', name: 'Control Center', icon: 'fa-sliders', description: 'Quick system toggles and status.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'calendar', name: 'Neural Calendar', icon: 'fa-calendar-days', description: 'Schedule and track learning milestones.', category: ModuleCategory.UTILITY, isSystem: true },
  { id: 'neural-stream', name: 'Neural Stream', icon: 'fa-bolt-lightning', description: 'AI Core status and curriculum engine controls.', category: ModuleCategory.UTILITY, isSystem: true },
  
  { id: 'armory', name: 'Neural Armory', icon: 'fa-shield-halved', description: 'Spend credits on gear and system upgrades.', category: ModuleCategory.BEHAVIOR_GAMIFICATION, isSystem: true },
  { id: 'trophy-room', name: 'Trophy Room', icon: 'fa-trophy', description: 'View your achievements and milestones.', category: ModuleCategory.BEHAVIOR_GAMIFICATION, isSystem: true },
  { id: 'bounty-board', name: 'Bounty Board', icon: 'fa-scroll', description: 'Accept specialized growth contracts.', category: ModuleCategory.BEHAVIOR_GAMIFICATION, isSystem: true },

  { id: 'calc', name: 'Smart Calc', icon: 'fa-calculator', description: 'Step-by-step math solver.', category: ModuleCategory.NATURAL_SCIENCES },
  { id: 'mindmap', name: 'Mind Mapper', icon: 'fa-brain', description: 'Visual concept mapping.', category: ModuleCategory.BEHAVIOR_GAMIFICATION },
  { id: 'timer', name: 'Focus Timer', icon: 'fa-clock', description: 'Pomodoro focus protocol.', category: ModuleCategory.UTILITY },
  { id: 'journal', name: 'Reflector', icon: 'fa-book-open-reader', description: 'Guided self-reflection logs.', category: ModuleCategory.BEHAVIOR_GAMIFICATION },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Alpha_Explorer', level: 14, xp: 5200 },
  { id: '2', name: 'Nexus_Seeker', level: 8, xp: 2800 },
  { id: '3', name: 'Explorer_082', level: 1, xp: 150, isCurrentUser: true },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'init-link', title: 'System Initiate', description: 'Successfully link with the Mechdyane Core.', icon: 'fa-plug-circle-check', isUnlocked: true, progress: 1, target: 1, rarity: 'Common' },
  { id: 'steady-flow', title: 'Steady Flow', description: 'Maintain a 7-day neural link streak.', icon: 'fa-fire', isUnlocked: false, progress: 1, target: 7, rarity: 'Rare' },
  { id: 'polymath', title: 'Digital Polymath', description: 'Master three different Knowledge Nodes.', icon: 'fa-graduation-cap', isUnlocked: false, progress: 0, target: 3, rarity: 'Legendary' },
  { id: 'deep-dive', title: 'Neural Diver', description: 'Complete an advanced Deep Dive lesson.', icon: 'fa-water', isUnlocked: false, progress: 0, target: 1, rarity: 'Artifact' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'item-1', name: 'Cyber Lens', description: 'Enhances focus mode efficiency by 5%.', icon: 'fa-eye', cost: 200, isOwned: true, isEquipped: true, rarity: 'Common', type: 'Visual' },
  { id: 'item-2', name: 'Logic Core', description: 'Increases quiz XP rewards by 10%.', icon: 'fa-microchip', cost: 500, isOwned: false, isEquipped: false, rarity: 'Rare', type: 'Buff' },
  { id: 'item-3', name: 'Thermal Shell', description: 'Reduces streak decay during downtime.', icon: 'fa-fire-extinguisher', cost: 1200, isOwned: false, isEquipped: false, rarity: 'Epic', type: 'Buff' },
  { id: 'item-4', name: 'Synaptic Blade', description: 'A legendary artifact for top-tier explorers.', icon: 'fa-bolt', cost: 5000, isOwned: false, isEquipped: false, rarity: 'Legendary', type: 'Collectible' },
];
