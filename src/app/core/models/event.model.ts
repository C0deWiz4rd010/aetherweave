export type EventOutcome =
  | 'heal'
  | 'damage'
  | 'gold'
  | 'loseGold'
  | 'gainCard'
  | 'maxHpUp'
  | 'maxHpDown'
  | 'gainRelic'
  | 'nothing';

export interface EventChoice {
  label: string;
  description: string;
  outcome: EventOutcome;
  amount?: number;
  cardId?: string;
  relicId?: string;
  resultText: string;
}

export interface EventDef {
  id: string;
  title: string;
  text: string;
  glyph: string;
  color: string;
  choices: EventChoice[];
}
