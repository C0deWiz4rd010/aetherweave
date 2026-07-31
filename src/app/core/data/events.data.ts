import type { EventDef } from '../models';

/** Narrative encounters offering risk/reward choices. */
export const EVENTS: EventDef[] = [
  {
    id: 'emberShrine',
    title: 'The Ember Shrine',
    text: 'A shrine of living flame pulses in the dark. It offers power — for a price of blood.',
    glyph: '🕯️',
    color: '#ff6b3d',
    choices: [
      {
        label: 'Offer blood',
        description: 'Lose 6 HP, gain the Molten Core relic.',
        outcome: 'gainRelic',
        relicId: 'moltenCore',
        amount: 6,
        resultText: 'The flame brands you. Your reactions now burn hotter.',
      },
      {
        label: 'Take a coal',
        description: 'Add Inferno to your deck.',
        outcome: 'gainCard',
        cardId: 'inferno',
        resultText: 'You pocket a smoldering coal that yearns to be unleashed.',
      },
      {
        label: 'Leave',
        description: 'Nothing ventured.',
        outcome: 'nothing',
        resultText: 'You step away from the heat.',
      },
    ],
  },
  {
    id: 'wanderingMerchant',
    title: 'The Wandering Weaver',
    text: 'A hooded figure spreads a cloth of curious trinkets and whispers of forgotten arts.',
    glyph: '🧙',
    color: '#9d7bff',
    choices: [
      {
        label: 'Trade coin for vigor',
        description: 'Lose 20 gold, raise max HP by 10.',
        outcome: 'maxHpUp',
        amount: 10,
        resultText: 'Warmth spreads through your limbs.',
      },
      {
        label: 'Buy a relic',
        description: 'Lose 45 gold, gain the Runic Tome.',
        outcome: 'gainRelic',
        relicId: 'runicTome',
        amount: 45,
        resultText: 'The tome hums with arcane script.',
      },
      {
        label: 'Decline',
        description: 'Keep your coin.',
        outcome: 'nothing',
        resultText: 'The weaver fades into the gloom.',
      },
    ],
  },
  {
    id: 'frozenWell',
    title: 'The Frozen Well',
    text: 'A well of black ice reflects a version of you that never faltered. It beckons.',
    glyph: '🧊',
    color: '#8fe4ff',
    choices: [
      {
        label: 'Reach in',
        description: 'Gain 40 gold, but take 8 damage.',
        outcome: 'gold',
        amount: 40,
        resultText: 'Frost bites your arm as you pull free a fistful of coin.',
      },
      {
        label: 'Drink deep',
        description: 'Heal to full, but lose 6 max HP.',
        outcome: 'maxHpDown',
        amount: 6,
        resultText: 'You are restored, though something is left behind in the ice.',
      },
      {
        label: 'Turn away',
        description: 'Refuse the reflection.',
        outcome: 'nothing',
        resultText: 'The reflection shatters as you leave.',
      },
    ],
  },
];

