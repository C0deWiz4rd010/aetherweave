import { Injectable } from '@angular/core';
import type {
  ElementType,
  ReactionResult,
  ReactionType,
  StatusMap,
} from '../models';

/** Elements that can be swirled/spread by Anemo. */
const SWIRLABLE: ElementType[] = ['pyro', 'hydro', 'cryo', 'electro'];

const EMPTY: ReactionResult = {
  reaction: null,
  damageMultiplier: 1,
  bonusDamage: 0,
  aoeDamage: 0,
  blockToPlayer: 0,
  inflicted: [],
  spreadElement: null,
  remainingAura: null,
};

/**
 * Pure resolver for elemental reactions. Given a target's current aura and an
 * incoming element, it returns the mechanical consequences. Fully deterministic
 * and side-effect free so it can be unit tested in isolation.
 */
@Injectable({ providedIn: 'root' })
export class ReactionEngineService {
  /** Returns which reaction (if any) two elements would produce. */
  predict(aura: ElementType | null, trigger: ElementType): ReactionType | null {
    if (!aura || aura === trigger) return null;
    if (aura === 'aether' || trigger === 'aether') return 'resonance';
    if (aura === 'geo' || trigger === 'geo') return 'crystallize';
    if (aura === 'anemo' || trigger === 'anemo') {
      const other = aura === 'anemo' ? trigger : aura;
      return SWIRLABLE.includes(other) ? 'swirl' : null;
    }
    return this.pairReaction(aura, trigger);
  }

  /** Full resolution of applying `trigger` onto an existing `aura`. */
  resolve(
    aura: ElementType | null,
    trigger: ElementType,
    targetStatuses: StatusMap = {},
  ): ReactionResult {
    // No aura, or same element: the trigger simply becomes/refreshes the aura.
    if (!aura || aura === trigger) {
      return { ...EMPTY, remainingAura: trigger };
    }

    const wet = (targetStatuses.wet ?? 0) > 0;

    if (aura === 'aether' || trigger === 'aether') {
      return {
        ...EMPTY,
        reaction: 'resonance',
        damageMultiplier: 1.5,
        bonusDamage: 4,
        remainingAura: null,
      };
    }

    if (aura === 'geo' || trigger === 'geo') {
      return {
        ...EMPTY,
        reaction: 'crystallize',
        blockToPlayer: 6,
        remainingAura: null,
      };
    }

    if (aura === 'anemo' || trigger === 'anemo') {
      const other = aura === 'anemo' ? trigger : aura;
      if (!SWIRLABLE.includes(other)) {
        return { ...EMPTY, remainingAura: trigger };
      }
      return {
        ...EMPTY,
        reaction: 'swirl',
        aoeDamage: 4,
        spreadElement: other,
        remainingAura: null,
      };
    }

    const reaction = this.pairReaction(aura, trigger);
    if (!reaction) return { ...EMPTY, remainingAura: trigger };

    switch (reaction) {
      case 'vaporize':
      case 'melt':
        return {
          ...EMPTY,
          reaction,
          damageMultiplier: 2,
          remainingAura: null,
        };
      case 'overload':
        return {
          ...EMPTY,
          reaction,
          bonusDamage: 8,
          aoeDamage: 6,
          remainingAura: null,
        };
      case 'electrocharged':
        return {
          ...EMPTY,
          reaction,
          aoeDamage: wet ? 8 : 5,
          inflicted: [{ status: 'shock', amount: 2 }],
          remainingAura: null,
        };
      case 'frozen':
        return {
          ...EMPTY,
          reaction,
          inflicted: [{ status: 'frozen', amount: 1 }],
          remainingAura: null,
        };
      case 'superconduct':
        return {
          ...EMPTY,
          reaction,
          aoeDamage: wet ? 5 : 3,
          inflicted: [{ status: 'vulnerable', amount: 2 }],
          remainingAura: null,
        };
      default:
        return { ...EMPTY, remainingAura: trigger };
    }
  }

  private pairReaction(
    a: ElementType,
    b: ElementType,
  ): ReactionType | null {
    const key = [a, b].sort().join('+');
    switch (key) {
      case 'hydro+pyro':
        return 'vaporize';
      case 'cryo+pyro':
        return 'melt';
      case 'electro+pyro':
        return 'overload';
      case 'cryo+hydro':
        return 'frozen';
      case 'electro+hydro':
        return 'electrocharged';
      case 'cryo+electro':
        return 'superconduct';
      default:
        return null;
    }
  }
}
