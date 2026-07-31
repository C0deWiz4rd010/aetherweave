// Status effects carried by the player and enemies.

export type StatusId =
  | 'burn' // damage over time at end of turn
  | 'chill' // reduces outgoing damage
  | 'frozen' // skips the next action
  | 'shock' // takes bonus damage when hit
  | 'wet' // amplifies cryo/electro reactions
  | 'poison' // damage over time, decrements each turn
  | 'vulnerable' // takes +50% damage
  | 'weak' // deals -25% damage
  | 'block' // temporary shield, cleared each turn
  | 'strength' // adds flat damage to attacks
  | 'regen' // heals over time
  | 'aetherCharge'; // stored aether resonance

export interface StatusInfo {
  id: StatusId;
  name: string;
  glyph: string;
  color: string;
  description: string;
  /** true = harmful to whoever holds it. */
  debuff: boolean;
  /** true = magnitude decays by 1 each turn (e.g. poison). */
  decays: boolean;
}

export type StatusMap = Partial<Record<StatusId, number>>;
