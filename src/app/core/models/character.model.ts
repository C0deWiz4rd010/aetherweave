import type { ElementType } from './element.model';

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  element: ElementType;
  color: string;
  glyph: string;
  description: string;
  startingHp: number;
  startingRelicId: string;
  /** Card ids composing the opening deck (with duplicates). */
  startingDeck: string[];
}
