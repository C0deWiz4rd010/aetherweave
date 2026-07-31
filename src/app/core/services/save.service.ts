import { Injectable } from '@angular/core';

export interface MetaProgress {
  unlockedCardIds: string[];
  unlockedCharacterIds: string[];
  runsWon: number;
  runsPlayed: number;
  highestAct: number;
  bestScore: number;
}

const META_KEY = 'aetherweave.meta.v1';

const DEFAULT_META: MetaProgress = {
  unlockedCardIds: [],
  unlockedCharacterIds: ['emberwright', 'tidecaller'],
  runsWon: 0,
  runsPlayed: 0,
  highestAct: 1,
  bestScore: 0,
};

/** Persists cross-run meta progression in localStorage with safe fallbacks. */
@Injectable({ providedIn: 'root' })
export class SaveService {
  loadMeta(): MetaProgress {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return { ...DEFAULT_META };
      return { ...DEFAULT_META, ...(JSON.parse(raw) as Partial<MetaProgress>) };
    } catch {
      return { ...DEFAULT_META };
    }
  }

  saveMeta(meta: MetaProgress): void {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  resetMeta(): void {
    try {
      localStorage.removeItem(META_KEY);
    } catch {
      /* ignore */
    }
  }
}
