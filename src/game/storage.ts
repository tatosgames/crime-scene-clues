import type { GameState } from "./types";

const KEY_PREFIX = "murdoku:level:";

export const saveProgress = (levelId: string, state: Partial<GameState>) => {
  try {
    localStorage.setItem(KEY_PREFIX + levelId, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const loadProgress = (levelId: string): Partial<GameState> | null => {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + levelId);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<GameState>;
  } catch {
    return null;
  }
};

export const clearProgress = (levelId: string) => {
  try {
    localStorage.removeItem(KEY_PREFIX + levelId);
  } catch {
    // ignore
  }
};