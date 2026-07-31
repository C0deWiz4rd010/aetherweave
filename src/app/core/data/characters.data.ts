import type { CharacterDef } from '../models';

export const CHARACTERS: Record<string, CharacterDef> = {
  emberwright: {
    id: 'emberwright',
    name: 'Kaelen',
    title: 'the Emberwright',
    element: 'pyro',
    color: '#ff6b3d',
    glyph: '🔥',
    description:
      'A pyromancer who thrives on aggression. Ignites foes, then detonates them with Vaporize and Melt.',
    startingHp: 72,
    startingRelicId: 'moltenCore',
    startingDeck: [
      'strike',
      'strike',
      'strike',
      'defend',
      'defend',
      'defend',
      'emberStrike',
      'emberStrike',
      'expose',
      'quench',
    ],
  },
  tidecaller: {
    id: 'tidecaller',
    name: 'Nerys',
    title: 'the Tidecaller',
    element: 'hydro',
    color: '#3db4ff',
    glyph: '💧',
    description:
      'A control weaver who drenches enemies and chains lightning through them with Electro-Charged.',
    startingHp: 80,
    startingRelicId: 'aetherPrism',
    startingDeck: [
      'strike',
      'strike',
      'strike',
      'defend',
      'defend',
      'defend',
      'tideLash',
      'tideLash',
      'spark',
      'glacialArmor',
    ],
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS);
