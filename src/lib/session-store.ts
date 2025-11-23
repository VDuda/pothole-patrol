import { PotholeReport } from '@/types/report';

const STORAGE_KEY = 'pothole_patrol_sessions';

export interface PatrolSession {
  id: string;
  startTime: number;
  endTime: number;
  reports: PotholeReport[];
  potholeCount: number;
  status: 'verified' | 'pending_upload' | 'uploaded';
  filecoinCid?: string;
  walletAddress?: string;
}

export const sessionStore = {
  saveSession: (reports: PotholeReport[], startTime: number): PatrolSession => {
    const sessions = sessionStore.getSessions();
    const endTime = Date.now();
    
    const newSession: PatrolSession = {
      id: `session-${startTime}`,
      startTime,
      endTime,
      reports,
      potholeCount: reports.length,
      status: 'pending_upload',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession, ...sessions]));
    return newSession;
  },

  getSessions: (): PatrolSession[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  updateSession: (sessionId: string, updates: Partial<PatrolSession>) => {
    const sessions = sessionStore.getSessions();
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, ...updates } : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  },
  
  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
