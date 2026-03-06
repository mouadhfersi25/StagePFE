/**
 * Pont entre le store auth (backend) et le contexte Auth des pages jeu.
 * Fournit useAuth() aux pages admin/player/educator/parent.
 */
import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { AuthContext as StoreAuthContext } from '@/store/auth/AuthContext';
import type { User, PlayerProfile } from '@/data/types';

interface AuthContextType {
  user: User | null;
  playerProfile: PlayerProfile | null;
  login: (user: User) => void;
  logout: () => void;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
}

const EduGameAuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoreUserWithFallback(storeUser: { email?: string; role?: string } | null): { email: string; role: string } | null {
  const email = storeUser?.email ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null);
  const role = storeUser?.role ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_role') : null);
  if (!email) return null;
  return { email, role: role || '' };
}

function mapStoreUserToEduGameUser(storeUser: { email?: string; role?: string } | null): User | null {
  const auth = getStoreUserWithFallback(storeUser);
  if (!auth) return null;
  const role = (auth.role || '').toUpperCase();
  const roleMap: Record<string, User['role']> = {
    JOUEUR: 'player',
    PARENT: 'parent',
    EDUCATEUR: 'educator',
    ADMIN: 'admin',
    SPONSOR: 'admin',
  };
  return {
    id: '1',
    name: auth.email.split('@')[0] || 'User',
    email: auth.email,
    role: roleMap[role] || 'player',
  };
}

export function EduGameAuthBridge({ children }: { children: ReactNode }) {
  const storeAuth = useContext(StoreAuthContext);
  const user = useMemo(() => mapStoreUserToEduGameUser(storeAuth?.user ?? null), [storeAuth?.user]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);

  // Initialiser un profil joueur par défaut dès qu'un user JOUEUR est connecté
  useEffect(() => {
    if (!user || user.role !== 'player') {
      setPlayerProfile(null);
      return;
    }
    setPlayerProfile((prev) => {
      if (prev) return prev;
      return {
        id: user.id,
        name: user.name,
        age: 12,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalScore: 0,
        badgesEarned: 0,
        currentStreak: 0,
        totalSessions: 0,
        weeklyPlayTime: '0 min',
        averageSuccessRate: 0,
        skills: { math: 0, logic: 0, memory: 0, reflex: 0 },
      };
    });
  }, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      playerProfile,
      login: () => {},
      logout: () => storeAuth?.logout?.(),
      updatePlayerProfile: (updates) =>
        setPlayerProfile((prev) => (prev ? { ...prev, ...updates } : prev)),
    }),
    [user, playerProfile, storeAuth]
  );

  return (
    <EduGameAuthContext.Provider value={value}>
      {children}
    </EduGameAuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(EduGameAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within EduGameAuthBridge');
  }
  return context;
}
