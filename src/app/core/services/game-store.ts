import { Injectable, computed, inject, signal } from '@angular/core';
import { SaveService, type MetaProgress } from './save.service';

export type GamePhase =
  | 'menu'
  | 'character-select'
  | 'map'
  | 'combat'
  | 'reward'
  | 'shop'
  | 'rest'
  | 'event'
  | 'victory'
  | 'defeat';

/**
 * Central signal-based store. Holds run-wide state and meta progression; the
 * combat/map services mutate it through dedicated methods. Feature components
 * read from the exposed signals/computed values.
 */
@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly save = inject(SaveService);

  readonly phase = signal<GamePhase>('menu');
  readonly seed = signal<number>(0);
  readonly meta = signal<MetaProgress>(this.save.loadMeta());

  readonly isRunActive = computed(() => this.seed() !== 0);

  setPhase(phase: GamePhase): void {
    this.phase.set(phase);
  }

  rollSeed(): number {
    const seed = (Math.random() * 0xffffffff) >>> 0;
    this.seed.set(seed);
    return seed;
  }

  patchMeta(partial: Partial<MetaProgress>): void {
    const next = { ...this.meta(), ...partial };
    this.meta.set(next);
    this.save.saveMeta(next);
  }
}
