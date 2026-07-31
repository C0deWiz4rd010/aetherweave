import type { EnemyDef } from '../models';

export const ENEMIES: Record<string, EnemyDef> = {
  // ---------------- Act 1 ----------------
  gloomSlime: {
    id: 'gloomSlime',
    name: 'Gloom Slime',
    act: 1,
    minHp: 22,
    maxHp: 28,
    glyph: '🟢',
    color: '#7ff7c3',
    moves: [
      { intent: { type: 'attack', damage: 6, hits: 1, label: 'Slam' }, weight: 3 },
      { intent: { type: 'defend', block: 6, label: 'Congeal' }, weight: 1 },
      { intent: { type: 'attack', damage: 4, hits: 1, element: 'hydro', label: 'Ooze' }, weight: 2 },
    ],
  },
  cinderWisp: {
    id: 'cinderWisp',
    name: 'Cinder Wisp',
    act: 1,
    minHp: 14,
    maxHp: 18,
    glyph: '🔥',
    color: '#ff6b3d',
    moves: [
      { intent: { type: 'attack', damage: 7, hits: 1, element: 'pyro', label: 'Scorch' }, weight: 3 },
      { intent: { type: 'buff', status: { target: 'self', status: 'strength', amount: 1 }, label: 'Flare' }, weight: 1 },
    ],
  },
  spireBrigand: {
    id: 'spireBrigand',
    name: 'Spire Brigand',
    act: 1,
    minHp: 26,
    maxHp: 32,
    glyph: '🗡️',
    color: '#a6a8d4',
    moves: [
      { intent: { type: 'attack', damage: 9, hits: 1, label: 'Cleave' }, weight: 2 },
      { intent: { type: 'attack-debuff', damage: 6, hits: 1, status: { target: 'player', status: 'weak', amount: 1 }, label: 'Hamstring' }, weight: 2 },
      { intent: { type: 'defend', block: 5, label: 'Brace' }, weight: 1 },
    ],
  },
  crystalGolem: {
    id: 'crystalGolem',
    name: 'Crystal Golem',
    act: 1,
    minHp: 46,
    maxHp: 52,
    glyph: '🗿',
    color: '#f2c14e',
    isElite: true,
    moves: [
      { intent: { type: 'attack', damage: 12, hits: 1, element: 'geo', label: 'Boulder' }, weight: 2 },
      { intent: { type: 'defend', block: 10, label: 'Fortify' }, weight: 1 },
      { intent: { type: 'attack-debuff', damage: 8, hits: 1, status: { target: 'player', status: 'vulnerable', amount: 1 }, label: 'Shatterblow' }, weight: 2 },
    ],
  },
  embermaw: {
    id: 'embermaw',
    name: 'Embermaw, the First Flame',
    act: 1,
    minHp: 92,
    maxHp: 92,
    glyph: '🐲',
    color: '#ff6b3d',
    isBoss: true,
    moves: [
      { intent: { type: 'attack', damage: 14, hits: 1, element: 'pyro', label: 'Maw' }, weight: 3 },
      { intent: { type: 'attack-debuff', damage: 6, hits: 1, element: 'pyro', status: { target: 'player', status: 'burn', amount: 2 }, label: 'Ashen Breath' }, weight: 2 },
      { intent: { type: 'buff', status: { target: 'self', status: 'strength', amount: 2 }, label: 'Stoke' }, weight: 1 },
    ],
  },

  // ---------------- Act 2 ----------------
  frostRevenant: {
    id: 'frostRevenant',
    name: 'Frost Revenant',
    act: 2,
    minHp: 30,
    maxHp: 36,
    glyph: '❄️',
    color: '#8fe4ff',
    moves: [
      { intent: { type: 'attack-debuff', damage: 8, hits: 1, element: 'cryo', status: { target: 'player', status: 'weak', amount: 1 }, label: 'Rime Slash' }, weight: 3 },
      { intent: { type: 'defend', block: 8, label: 'Frostguard' }, weight: 2 },
    ],
  },
  stormHarpy: {
    id: 'stormHarpy',
    name: 'Storm Harpy',
    act: 2,
    minHp: 24,
    maxHp: 30,
    glyph: '🦅',
    color: '#c77bff',
    moves: [
      { intent: { type: 'attack', damage: 5, hits: 2, element: 'electro', label: 'Talon Flurry' }, weight: 3 },
      { intent: { type: 'buff', status: { target: 'self', status: 'strength', amount: 2 }, label: 'Updraft' }, weight: 1 },
    ],
  },
  bogLurker: {
    id: 'bogLurker',
    name: 'Bog Lurker',
    act: 2,
    minHp: 40,
    maxHp: 46,
    glyph: '🐸',
    color: '#3db4ff',
    moves: [
      { intent: { type: 'attack-debuff', damage: 10, hits: 1, element: 'hydro', status: { target: 'player', status: 'weak', amount: 1 }, label: 'Drench' }, weight: 3 },
      { intent: { type: 'defend', block: 9, label: 'Sink' }, weight: 2 },
    ],
  },
  thunderSentinel: {
    id: 'thunderSentinel',
    name: 'Thunder Sentinel',
    act: 2,
    minHp: 62,
    maxHp: 68,
    glyph: '⚡',
    color: '#c77bff',
    isElite: true,
    moves: [
      { intent: { type: 'attack', damage: 16, hits: 1, element: 'electro', label: 'Arc Smite' }, weight: 2 },
      { intent: { type: 'attack', damage: 6, hits: 1, element: 'electro', label: 'Static Wave' }, weight: 2 },
      { intent: { type: 'defend', block: 12, label: 'Ward' }, weight: 1 },
    ],
  },
  tidewarden: {
    id: 'tidewarden',
    name: 'Tidewarden of the Deep',
    act: 2,
    minHp: 130,
    maxHp: 130,
    glyph: '🌊',
    color: '#3db4ff',
    isBoss: true,
    moves: [
      { intent: { type: 'attack-debuff', damage: 12, hits: 1, element: 'hydro', status: { target: 'player', status: 'weak', amount: 1 }, label: 'Crushing Wave' }, weight: 3 },
      { intent: { type: 'attack', damage: 9, hits: 1, element: 'hydro', label: 'Undertow' }, weight: 2 },
      { intent: { type: 'buff', status: { target: 'self', status: 'strength', amount: 2 }, label: 'Swell' }, weight: 1 },
    ],
  },

  // ---------------- Act 3 ----------------
  voidAcolyte: {
    id: 'voidAcolyte',
    name: 'Void Acolyte',
    act: 3,
    minHp: 34,
    maxHp: 40,
    glyph: '🌌',
    color: '#ffd6f5',
    moves: [
      { intent: { type: 'attack-debuff', damage: 11, hits: 1, element: 'aether', status: { target: 'player', status: 'vulnerable', amount: 1 }, label: 'Unravel' }, weight: 3 },
      { intent: { type: 'defend', block: 8, label: 'Phase' }, weight: 1 },
    ],
  },
  spireGuardian: {
    id: 'spireGuardian',
    name: 'Spire Guardian',
    act: 3,
    minHp: 50,
    maxHp: 56,
    glyph: '🛡️',
    color: '#f2c14e',
    moves: [
      { intent: { type: 'attack', damage: 13, hits: 1, element: 'geo', label: 'Warhammer' }, weight: 2 },
      { intent: { type: 'defend', block: 12, label: 'Aegis' }, weight: 2 },
    ],
  },
  eclipseKnight: {
    id: 'eclipseKnight',
    name: 'Eclipse Knight',
    act: 3,
    minHp: 84,
    maxHp: 90,
    glyph: '⚔️',
    color: '#9d7bff',
    isElite: true,
    moves: [
      { intent: { type: 'attack', damage: 20, hits: 1, label: 'Umbral Slash' }, weight: 2 },
      { intent: { type: 'attack-debuff', damage: 12, hits: 1, status: { target: 'player', status: 'weak', amount: 2 }, label: 'Nightfall' }, weight: 2 },
      { intent: { type: 'defend', block: 14, label: 'Eclipse Guard' }, weight: 1 },
    ],
  },
  aetherTyrant: {
    id: 'aetherTyrant',
    name: 'The Aether Tyrant',
    act: 3,
    minHp: 200,
    maxHp: 200,
    glyph: '👑',
    color: '#ffd6f5',
    isBoss: true,
    moves: [
      { intent: { type: 'attack', damage: 18, hits: 1, element: 'aether', label: 'Oblivion' }, weight: 3 },
      { intent: { type: 'attack', damage: 12, hits: 1, element: 'aether', label: 'Rift' }, weight: 2 },
      { intent: { type: 'buff', status: { target: 'self', status: 'strength', amount: 3 }, label: 'Ascend' }, weight: 1 },
    ],
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES);

export const NORMAL_ENEMIES_BY_ACT: Record<number, string[]> = {
  1: ['gloomSlime', 'cinderWisp', 'spireBrigand'],
  2: ['frostRevenant', 'stormHarpy', 'bogLurker'],
  3: ['voidAcolyte', 'spireGuardian'],
};

export const ELITES_BY_ACT: Record<number, string[]> = {
  1: ['crystalGolem'],
  2: ['thunderSentinel'],
  3: ['eclipseKnight'],
};

export const BOSS_BY_ACT: Record<number, string> = {
  1: 'embermaw',
  2: 'tidewarden',
  3: 'aetherTyrant',
};
