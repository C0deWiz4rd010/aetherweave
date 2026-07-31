import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CombatService } from '../../core/services/combat.service';
import { GameStore } from '../../core/services/game-store';
import { RunService } from '../../core/services/run.service';
import { RngService } from '../../core/services/rng.service';
import { CARDS, REWARD_CARD_IDS } from '../../core/data/cards.data';
import { ELEMENTS } from '../../core/data/elements.data';
import type { CardDef } from '../../core/models';

@Component({
  selector: 'app-reward',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reward.html',
  styleUrl: './reward.scss',
})
export class Reward {
  private readonly combat = inject(CombatService);
  private readonly store = inject(GameStore);
  private readonly run = inject(RunService);
  private readonly rng = inject(RngService);

  protected readonly elements = ELEMENTS;
  protected readonly gold = signal(0);
  protected readonly options = signal<CardDef[]>([]);
  protected readonly cardTaken = signal(false);

  constructor() {
    const reward = this.combat.goldReward();
    this.gold.set(reward);
    this.store.addGold(reward);
    this.options.set(this.rng.sample(REWARD_CARD_IDS, 3).map((id) => CARDS[id]));
  }

  protected accent(card: CardDef): string {
    return card.element ? ELEMENTS[card.element].color : 'var(--accent)';
  }

  protected take(card: CardDef): void {
    if (this.cardTaken()) return;
    this.store.addCard(card.id);
    this.cardTaken.set(true);
    this.continue();
  }

  protected continue(): void {
    this.run.advance();
  }
}
