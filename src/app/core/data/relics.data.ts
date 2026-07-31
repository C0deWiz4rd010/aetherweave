import type { RelicDef } from '../models';

/**
 * Relics are rule-changing passives. Each id is honoured by the combat service
 * or store at the point named by its `trigger`.
 */
export const RELICS: Record<string, RelicDef> = {
  moltenCore: {
    id: 'moltenCore',
    name: 'Molten Core',
    description: 'Every elemental reaction deals +3 bonus damage.',
    glyph: '🌋',
    color: '#ff6b3d',
    trigger: 'passive',
    rarity: 'common',
  },
  aetherPrism: {
    id: 'aetherPrism',
    name: 'Aether Prism',
    description: 'Whenever a reaction triggers, gain 2 Block.',
    glyph: '🔷',
    color: '#6be1ff',
    trigger: 'onReaction',
    rarity: 'common',
  },
  wardingStone: {
    id: 'wardingStone',
    name: 'Warding Stone',
    description: 'At the start of each combat, gain 8 Block.',
    glyph: '🪨',
    color: '#f2c14e',
    trigger: 'combatStart',
    rarity: 'common',
  },
  runicTome: {
    id: 'runicTome',
    name: 'Runic Tome',
    description: 'Draw 1 additional card each turn.',
    glyph: '📖',
    color: '#9d7bff',
    trigger: 'passive',
    rarity: 'uncommon',
  },
  vigorCharm: {
    id: 'vigorCharm',
    name: 'Vigor Charm',
    description: 'At the start of each combat, heal 5 HP.',
    glyph: '🍀',
    color: '#6bffb0',
    trigger: 'combatStart',
    rarity: 'common',
  },
  greedyIdol: {
    id: 'greedyIdol',
    name: 'Greedy Idol',
    description: 'Gain 30% more gold from combats.',
    glyph: '💰',
    color: '#f2c14e',
    trigger: 'passive',
    rarity: 'uncommon',
  },
  stormglass: {
    id: 'stormglass',
    name: 'Stormglass',
    description: 'Area-of-effect reaction damage is increased by 3.',
    glyph: '🌩️',
    color: '#c77bff',
    trigger: 'passive',
    rarity: 'uncommon',
  },
  phoenixFeather: {
    id: 'phoenixFeather',
    name: 'Phoenix Feather',
    description: 'Once per combat, survive a lethal blow at 1 HP.',
    glyph: '🪶',
    color: '#ff8f6b',
    trigger: 'passive',
    rarity: 'rare',
  },
  energyCrystal: {
    id: 'energyCrystal',
    name: 'Energy Crystal',
    description: 'Gain +1 maximum energy each turn.',
    glyph: '💎',
    color: '#6be1ff',
    trigger: 'passive',
    rarity: 'boss',
  },
  ironwoodCharm: {
    id: 'ironwoodCharm',
    name: 'Ironwood Charm',
    description: 'Raise maximum HP by 12.',
    glyph: '🌳',
    color: '#7ff7c3',
    trigger: 'passive',
    rarity: 'uncommon',
  },
};

export const RELIC_IDS = Object.keys(RELICS);

/** Relics that can be found as rewards (excludes starter/boss-only picks). */
export const FINDABLE_RELIC_IDS = RELIC_IDS.filter(
  (id) => RELICS[id].rarity !== 'boss',
);
