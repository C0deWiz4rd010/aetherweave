import type { ElementType } from './element.model';
import type { StatusId } from './status.model';

export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare';
export type CardTarget = 'enemy' | 'all-enemies' | 'self' | 'none';

export interface StatusApplication {
  target: 'enemy' | 'self';
  status: StatusId;
  amount: number;
}

export interface CardEffect {
  /** Base damage per hit before modifiers. */
  damage?: number;
  hits?: number;
  block?: number;
  /** Element imbued onto the target when this card deals damage. */
  element?: ElementType;
  applyStatus?: StatusApplication[];
  draw?: number;
  gainEnergy?: number;
  heal?: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  target: CardTarget;
  element?: ElementType;
  description: string;
  effect: CardEffect;
  exhaust?: boolean;
}

export interface CardInstance extends CardDef {
  /** Unique per copy so duplicates in a deck are distinguishable. */
  uid: string;
}
