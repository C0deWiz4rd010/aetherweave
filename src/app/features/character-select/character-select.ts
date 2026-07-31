import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../core/services/game-store';
import { RunService } from '../../core/services/run.service';
import { CHARACTERS, CHARACTER_IDS } from '../../core/data/characters.data';
import { CARDS } from '../../core/data/cards.data';
import { RELICS } from '../../core/data/relics.data';

@Component({
  selector: 'app-character-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-select.html',
  styleUrl: './character-select.scss',
})
export class CharacterSelect {
  private readonly router = inject(Router);
  private readonly store = inject(GameStore);
  private readonly run = inject(RunService);

  protected readonly characters = CHARACTER_IDS.map((id) => CHARACTERS[id]);
  protected readonly cards = CARDS;
  protected readonly relics = RELICS;
  protected readonly selected = signal<string>(this.characters[0].id);

  protected select(id: string): void {
    this.selected.set(id);
  }

  protected deckPreview(id: string): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const cardId of CHARACTERS[id].startingDeck) {
      counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
    }
    return [...counts.entries()].map(([cardId, count]) => ({
      name: CARDS[cardId].name,
      count,
    }));
  }

  protected embark(): void {
    this.store.newRun(this.selected());
    this.run.startAct();
    this.router.navigate(['/map']);
  }

  protected back(): void {
    this.router.navigate(['/menu']);
  }
}
