import { Injectable, computed, inject, signal } from '@angular/core';
import { SaveService, type MetaProgress } from './save.service';
import { CARDS } from '../data/cards.data';
import { CHARACTERS } from '../data/characters.data';
import { RELICS } from '../data/relics.data';
import type { CardInstance } from '../models';

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

let uidCounter = 0;
export function makeCard(cardId: string): CardInstance {
  const def = CARDS[cardId];
  if (!def) throw new Error(`Unknown card: ${cardId}`);
  return { ...def, uid: `${cardId}-${uidCounter++}` };
}

/**
 * Central signal-based store holding run-wide state (player, deck, relics, gold,
 * act progress) and persistent meta progression. Combat/map services read and
 * mutate this through the exposed methods.
 */
@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly save = inject(SaveService);

  readonly phase = signal<GamePhase>('menu');
  readonly seed = signal<number>(0);
  readonly meta = signal<MetaProgress>(this.save.loadMeta());

  // ---- Run state ----
  readonly characterId = signal<string>('');
  readonly hp = signal<number>(0);
  readonly maxHp = signal<number>(0);
  readonly gold = signal<number>(0);
  readonly relics = signal<string[]>([]);
  readonly deck = signal<CardInstance[]>([]);
  readonly act = signal<number>(1);
  readonly floor = signal<number>(0);
  readonly score = signal<number>(0);

  readonly isRunActive = computed(() => this.seed() !== 0);
  readonly hasRelic = (id: string) => this.relics().includes(id);

  setPhase(phase: GamePhase): void {
    this.phase.set(phase);
  }

  newRun(characterId: string): void {
    const c = CHARACTERS[characterId];
    if (!c) throw new Error(`Unknown character: ${characterId}`);

    this.seed.set((Math.random() * 0xffffffff) >>> 0);
    this.characterId.set(characterId);
    this.maxHp.set(c.startingHp);
    this.hp.set(c.startingHp);
    this.gold.set(99);
    this.relics.set([]);
    this.deck.set(c.startingDeck.map(makeCard));
    this.act.set(1);
    this.floor.set(0);
    this.score.set(0);

    this.addRelic(c.startingRelicId);
    this.patchMeta({ runsPlayed: this.meta().runsPlayed + 1 });
  }

  addRelic(id: string): void {
    if (!RELICS[id] || this.hasRelic(id)) return;
    this.relics.update((r) => [...r, id]);
    if (id === 'ironwoodCharm') {
      this.maxHp.update((m) => m + 12);
      this.hp.update((h) => h + 12);
    }
  }

  addCard(cardId: string): void {
    this.deck.update((d) => [...d, makeCard(cardId)]);
  }

  removeCard(uid: string): void {
    this.deck.update((d) => d.filter((c) => c.uid !== uid));
  }

  addGold(amount: number): void {
    this.gold.update((g) => g + amount);
  }

  spendGold(amount: number): boolean {
    if (this.gold() < amount) return false;
    this.gold.update((g) => g - amount);
    return true;
  }

  heal(amount: number): void {
    this.hp.update((h) => Math.min(this.maxHp(), h + amount));
  }

  damage(amount: number): void {
    this.hp.update((h) => Math.max(0, h - amount));
  }

  raiseMaxHp(amount: number): void {
    this.maxHp.update((m) => m + amount);
    this.heal(amount);
  }

  lowerMaxHp(amount: number): void {
    this.maxHp.update((m) => Math.max(1, m - amount));
    this.hp.update((h) => Math.min(this.maxHp(), h));
  }

  addScore(amount: number): void {
    this.score.update((s) => s + amount);
  }

  patchMeta(partial: Partial<MetaProgress>): void {
    const next = { ...this.meta(), ...partial };
    this.meta.set(next);
    this.save.saveMeta(next);
  }

  recordVictory(): void {
    const meta = this.meta();
    this.patchMeta({
      runsWon: meta.runsWon + 1,
      bestScore: Math.max(meta.bestScore, this.score()),
    });
  }
}
