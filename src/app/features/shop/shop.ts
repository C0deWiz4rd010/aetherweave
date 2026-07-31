import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GameStore } from '../../core/services/game-store';
import { RunService } from '../../core/services/run.service';
import { RngService } from '../../core/services/rng.service';
import { CARDS, REWARD_CARD_IDS } from '../../core/data/cards.data';
import { RELICS, FINDABLE_RELIC_IDS } from '../../core/data/relics.data';
import { ELEMENTS } from '../../core/data/elements.data';
import type { CardDef, CardInstance, CardRarity } from '../../core/models';

interface ShopCard {
  card: CardDef;
  price: number;
  sold: boolean;
}

const PRICE: Record<CardRarity, number> = {
  basic: 40,
  common: 45,
  uncommon: 70,
  rare: 120,
};
const REMOVE_COST = 75;

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {
  protected readonly store = inject(GameStore);
  private readonly run = inject(RunService);
  private readonly rng = inject(RngService);

  protected readonly elements = ELEMENTS;
  protected readonly removeCost = REMOVE_COST;

  protected readonly cards = signal<ShopCard[]>(
    this.rng.sample(REWARD_CARD_IDS, 4).map((id) => ({
      card: CARDS[id],
      price: PRICE[CARDS[id].rarity],
      sold: false,
    })),
  );

  protected readonly relicId = signal<string | null>(
    this.pickRelic(),
  );
  protected readonly relicPrice = 130;
  protected readonly relicSold = signal(false);
  protected readonly relics = RELICS;

  protected readonly removing = signal(false);

  private pickRelic(): string | null {
    const owned = this.store.relics();
    const pool = FINDABLE_RELIC_IDS.filter((id) => !owned.includes(id));
    return pool.length ? this.rng.pick(pool) : null;
  }

  protected accent(card: CardDef): string {
    return card.element ? ELEMENTS[card.element].color : 'var(--accent)';
  }

  protected buyCard(item: ShopCard): void {
    if (item.sold || !this.store.spendGold(item.price)) return;
    this.store.addCard(item.card.id);
    this.cards.update((list) =>
      list.map((c) => (c.card.id === item.card.id ? { ...c, sold: true } : c)),
    );
  }

  protected buyRelic(): void {
    const id = this.relicId();
    if (!id || this.relicSold() || !this.store.spendGold(this.relicPrice)) return;
    this.store.addRelic(id);
    this.relicSold.set(true);
  }

  protected removeCard(card: CardInstance): void {
    if (!this.removing()) return;
    if (!this.store.spendGold(REMOVE_COST)) return;
    this.store.removeCard(card.uid);
    this.removing.set(false);
  }

  protected leave(): void {
    this.run.advance();
  }
}
