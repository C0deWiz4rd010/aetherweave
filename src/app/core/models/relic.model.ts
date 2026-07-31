export type RelicTrigger =
  | 'combatStart'
  | 'turnStart'
  | 'onReaction'
  | 'onPlayCard'
  | 'passive';

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'boss';

export interface RelicDef {
  id: string;
  name: string;
  description: string;
  glyph: string;
  color: string;
  trigger: RelicTrigger;
  rarity: RelicRarity;
}
