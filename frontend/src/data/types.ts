// Types (données réelles via API)
// UserDTO et types requêtes/réponses API : @/api/types

export type { UserDTO } from '@/api/types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'parent' | 'admin' | 'educator';
  age?: number;
  avatar?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalScore: number;
  badgesEarned: number;
  currentStreak: number;
  totalSessions: number;
  weeklyPlayTime: string;
  averageSuccessRate: number;
  skills: { math: number; logic: number; memory: number; reflex: number };
}

export interface Game {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'memory' | 'logic' | 'reflex';
  ageRange: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  icon: string;
  active?: boolean;
}

export interface Session {
  id: string;
  gameId: string;
  gameTitle: string;
  gameType: string;
  dateDebut: string;
  duree: string;
  scoreFinal: number;
  niveauAtteint: number;
  reussite: boolean;
  statut: 'EN_COURS' | 'TERMINEE' | 'ABANDONNEE';
  mode: 'Individual' | 'Collective';
  accuracy?: number;
  reactionTime?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  earned: boolean;
  earnedDate?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface AdminPlayer {
  id: string;
  avatar: string;
  name: string;
  email: string;
  age: number;
  level: number;
  score: number;
  status: 'Active' | 'Suspended';
  joinDate: string;
  lastActive: string;
}

export interface AdminQuestion {
  id: string;
  content: string;
  gameId: string;
  gameName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options: string[];
  correctAnswer: number;
  createdDate: string;
  createdBy: string;
}

export interface ModerationItem {
  id: string;
  type: 'question' | 'comment' | 'report';
  content: string;
  reportedBy: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}
