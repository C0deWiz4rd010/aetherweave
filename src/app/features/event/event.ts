import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GameStore } from '../../core/services/game-store';
import { RunService } from '../../core/services/run.service';
import type { EventChoice } from '../../core/models';

@Component({
  selector: 'app-event',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event.html',
  styleUrl: './event.scss',
})
export class GameEvent {
  protected readonly store = inject(GameStore);
  protected readonly run = inject(RunService);

  protected readonly event = this.run.currentEvent();
  protected readonly resolved = signal<string | null>(null);

  protected affordable(choice: EventChoice): boolean {
    if (choice.costType === 'gold') return this.store.gold() >= (choice.costAmount ?? 0);
    return true;
  }

  protected pick(choice: EventChoice): void {
    if (this.resolved() || !this.affordable(choice)) return;

    if (choice.costType === 'hp') this.store.damage(choice.costAmount ?? 0);
    if (choice.costType === 'gold') this.store.spendGold(choice.costAmount ?? 0);

    switch (choice.outcome) {
      case 'heal':
        this.store.heal(choice.amount ?? 0);
        break;
      case 'damage':
        this.store.damage(choice.amount ?? 0);
        break;
      case 'gold':
        this.store.addGold(choice.amount ?? 0);
        break;
      case 'loseGold':
        this.store.spendGold(choice.amount ?? 0);
        break;
      case 'gainCard':
        if (choice.cardId) this.store.addCard(choice.cardId);
        break;
      case 'gainRelic':
        if (choice.relicId) this.store.addRelic(choice.relicId);
        break;
      case 'maxHpUp':
        this.store.raiseMaxHp(choice.amount ?? 0);
        break;
      case 'maxHpDown':
        this.store.lowerMaxHp(choice.amount ?? 0);
        break;
      case 'nothing':
      default:
        break;
    }

    this.resolved.set(choice.resultText);
  }

  protected continue(): void {
    this.run.advance();
  }
}
