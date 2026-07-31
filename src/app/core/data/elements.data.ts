import type {
  ElementInfo,
  ElementType,
  ReactionInfo,
  ReactionType,
} from '../models';

export const ELEMENTS: Record<ElementType, ElementInfo> = {
  pyro: {
    id: 'pyro',
    name: 'Pyro',
    color: '#ff6b3d',
    glyph: '🔥',
    description: 'Ignites. Reacts fiercely with Hydro and Cryo.',
  },
  hydro: {
    id: 'hydro',
    name: 'Hydro',
    color: '#3db4ff',
    glyph: '💧',
    description: 'Drenches foes, empowering Cryo and Electro.',
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo',
    color: '#8fe4ff',
    glyph: '❄️',
    description: 'Chills and freezes, halting enemy actions.',
  },
  electro: {
    id: 'electro',
    name: 'Electro',
    color: '#c77bff',
    glyph: '⚡',
    description: 'Arcs between foes, chaining and bursting.',
  },
  geo: {
    id: 'geo',
    name: 'Geo',
    color: '#f2c14e',
    glyph: '🪨',
    description: 'Crystallizes reactions into protective shards.',
  },
  anemo: {
    id: 'anemo',
    name: 'Anemo',
    color: '#7ff7c3',
    glyph: '🌀',
    description: 'Swirls auras, spreading them across the battlefield.',
  },
  aether: {
    id: 'aether',
    name: 'Aether',
    color: '#ffd6f5',
    glyph: '✦',
    description: 'The wild essence. Resonates with every element.',
  },
};

export const ELEMENT_ORDER: ElementType[] = [
  'pyro',
  'hydro',
  'cryo',
  'electro',
  'geo',
  'anemo',
  'aether',
];

export const REACTIONS: Record<ReactionType, ReactionInfo> = {
  vaporize: {
    id: 'vaporize',
    name: 'Vaporize',
    color: '#ffb199',
    description: 'Pyro + Hydro — damage is doubled in a burst of steam.',
  },
  melt: {
    id: 'melt',
    name: 'Melt',
    color: '#ffcaa8',
    description: 'Pyro + Cryo — damage is doubled as ice flash-melts.',
  },
  overload: {
    id: 'overload',
    name: 'Overload',
    color: '#ff8f6b',
    description: 'Pyro + Electro — a blast splashes all enemies.',
  },
  electrocharged: {
    id: 'electrocharged',
    name: 'Electro-Charged',
    color: '#b98cff',
    description: 'Hydro + Electro — current arcs to every wet foe.',
  },
  frozen: {
    id: 'frozen',
    name: 'Frozen',
    color: '#aef0ff',
    description: 'Hydro + Cryo — the target is frozen and loses its turn.',
  },
  superconduct: {
    id: 'superconduct',
    name: 'Superconduct',
    color: '#9fdcff',
    description: 'Cryo + Electro — shatters defenses, making foes vulnerable.',
  },
  crystallize: {
    id: 'crystallize',
    name: 'Crystallize',
    color: '#f4d06a',
    description: 'Geo + any — condenses a shard of block for you.',
  },
  swirl: {
    id: 'swirl',
    name: 'Swirl',
    color: '#8ff7cd',
    description: 'Anemo + any — spreads the aura to all enemies.',
  },
  resonance: {
    id: 'resonance',
    name: 'Resonance',
    color: '#ffd6f5',
    description: 'Aether amplifies the strike and stores charge.',
  },
};
