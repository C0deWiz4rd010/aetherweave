// Elemental system — the signature mechanic of Aetherweave.

export type ElementType =
  | 'pyro'
  | 'hydro'
  | 'cryo'
  | 'electro'
  | 'geo'
  | 'anemo'
  | 'aether';

export interface ElementInfo {
  id: ElementType;
  name: string;
  color: string;
  glyph: string;
  description: string;
}

export type ReactionType =
  | 'vaporize'
  | 'melt'
  | 'overload'
  | 'electrocharged'
  | 'frozen'
  | 'superconduct'
  | 'crystallize'
  | 'swirl'
  | 'resonance';

export interface ReactionInfo {
  id: ReactionType;
  name: string;
  color: string;
  description: string;
}

/** Result of resolving one element applied onto an existing aura. */
export interface ReactionResult {
  reaction: ReactionType | null;
  /** Multiplier applied to the incoming hit's damage. */
  damageMultiplier: number;
  /** Flat bonus damage dealt to the primary target. */
  bonusDamage: number;
  /** Bonus damage splashed to all other enemies (overload/electro-charged). */
  aoeDamage: number;
  /** Block granted to the player (crystallize). */
  blockToPlayer: number;
  /** Statuses applied to the primary target as a consequence of the reaction. */
  inflicted: { status: StatusId; amount: number }[];
  /** If set, the aura spreads this element to all enemies (swirl). */
  spreadElement: ElementType | null;
  /** The aura that remains on the target after the reaction. */
  remainingAura: ElementType | null;
}

// Re-exported here to avoid a circular import in reaction results.
import type { StatusId } from './status.model';
