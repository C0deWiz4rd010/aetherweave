import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { CombatService } from '../../core/services/combat.service';
import { GameStore } from '../../core/services/game-store';
import { CHARACTERS } from '../../core/data/characters.data';
import type { CardInstance } from '../../core/models';
import type { Floater } from '../../core/services/combat.service';
import { Card } from './components/card/card';
import { Enemy } from './components/enemy/enemy';
import { PlayerPanel } from './components/player-panel/player-panel';

@Component({
  selector: 'app-combat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Enemy, PlayerPanel, TitleCasePipe],
  templateUrl: './combat.html',
  styleUrl: './combat.scss',
})
export class Combat {
  protected readonly combat = inject(CombatService);
  protected readonly store = inject(GameStore);
  private readonly router = inject(Router);

  protected readonly selectedCard = signal<string | null>(null);
  protected readonly showLog = signal(false);
  protected readonly screenShake = signal(false);
  protected readonly reactionBanner = signal<{ id: number; text: string } | null>(null);
  private lastReactionId = -1;

  protected readonly hero = computed(() => CHARACTERS[this.store.characterId()]);

  constructor() {
    const enemies = this.store.encounter();
    if (enemies.length) this.combat.start(enemies);

    // route away once the outcome resolves
    effect(() => {
      const r = this.combat.result();
      if (r === 'win') this.store.setPhase('reward');
      if (r === 'lose') this.store.setPhase('defeat');
    });

    // screen shake + banner when a reaction fires
    effect(() => {
      const reactions = this.combat.floaters().filter((f) => f.kind === 'reaction');
      const newest = reactions[reactions.length - 1];
      if (newest && newest.id !== this.lastReactionId) {
        this.lastReactionId = newest.id;
        this.reactionBanner.set({ id: newest.id, text: newest.text ?? '' });
        this.screenShake.set(true);
        setTimeout(() => this.screenShake.set(false), 380);
        setTimeout(() => {
          if (this.reactionBanner()?.id === newest.id) this.reactionBanner.set(null);
        }, 950);
      }
    });
  }

  protected handTransform(i: number): string {
    const n = this.combat.hand().length;
    const mid = (n - 1) / 2;
    const offset = i - mid;
    const rot = offset * 2.4;
    const lift = Math.abs(offset) * 4;
    return `rotate(${rot}deg) translateY(${lift}px)`;
  }

  protected floatersFor(target: string): Floater[] {
    return this.combat.floaters().filter((f) => f.target === target);
  }

  protected pickCard(uid: string): void {
    const card = this.combat.hand().find((c) => c.uid === uid);
    if (!card || !this.combat.canPlay(card)) return;
    if (this.combat.needsTarget(card)) {
      this.selectedCard.update((s) => (s === uid ? null : uid));
    } else {
      this.combat.playCard(uid);
      this.selectedCard.set(null);
    }
  }

  protected targetEnemy(enemyUid: string): void {
    const sel = this.selectedCard();
    if (!sel) return;
    this.combat.playCard(sel, enemyUid);
    this.selectedCard.set(null);
  }

  protected isTargeting = computed(() => this.selectedCard() !== null);

  protected endTurn(): void {
    this.selectedCard.set(null);
    this.combat.endTurn();
  }

  protected toReward(): void {
    this.router.navigate(['/reward']);
  }

  protected toDefeat(): void {
    this.router.navigate(['/result']);
  }

  protected trackCard = (_: number, c: CardInstance) => c.uid;
}
