
export enum ModuleCategory {
  ARTS_HUMANITIES = 'Arts & Humanities',
  SOCIAL_SCIENCES = 'Social Sciences',
  EDUCATION = 'Education',
  BUSINESS_ECONOMICS = 'Business & Economics',
  COMPUTER_SCIENCE = 'CS & IT',
  ENGINEERING_TECH = 'Engineering & Tech',
  NATURAL_SCIENCES = 'Natural Sciences',
  HEALTH_SCIENCES = 'Health & Life Sciences',
  LAW_GOVERNANCE = 'Law & Governance',
  THEOLOGY_MINISTRY = 'Theology & Ministry',
  CREATIVE_DESIGN = 'Creative & Design',
  BEHAVIOR_GAMIFICATION = 'Behavior & Gamification',
  UTILITY = 'System'
}

/* Base ID type for applications and modules in Mechdyane OS */
export type AppId = string;

export interface QuizOption {
  text: string;
  letter: 'A' | 'B' | 'C' | 'D';
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  correctLetter: 'A' | 'B' | 'C' | 'D';
}

export interface Milestone {
  id: string;
  title: string;
  content: string;
  xp: number;
  quizzes?: QuizQuestion[];
  isCompleted: boolean;
  detailedNotes?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  outline: string[];
  icon: string;
  color: string;
  category: ModuleCategory;
  progress: number;
  lessonsFinished: number;
  totalLessons: number;
  milestones: Milestone[];
  difficulty?: string;
  isEnrolled?: boolean;
  dynamicPoints?: number;
  masteryLevel?: number;
  isSynthesized?: boolean; // New: Tracks if the AI has generated the curriculum roadmap
}

export interface UserState {
  name: string;
  avatar?: string;
  institution?: string;
  specialization?: string;
  bio?: string;
  level: number;
  xp: number;
  credits: number;
  streak: number;
  lessonsFinished: number;
  activeModuleId: string;
  badges: string[]; // IDs of unlocked badges/achievements
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SoftwareApp {
  id: AppId;
  name: string;
  icon: string;
  description: string;
  category: ModuleCategory;
  isSystem?: boolean;
  isCourse?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Artifact';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  isOwned: boolean;
  isEquipped: boolean;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  type: 'Visual' | 'Buff' | 'Collectible';
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  shape?: 'rectangle' | 'ellipse';
  textAlign?: 'left' | 'center' | 'right';
}

export interface MindMapEdge {
  id: string;
  fromId: string;
  toId: string;
}

export interface RewardToast {
  id: string;
  amount: string;
  type: 'xp' | 'credits' | 'error';
  timestamp: number;
}

export interface SystemError {
  code: string;
  message: string;
  suggestion: string;
}
