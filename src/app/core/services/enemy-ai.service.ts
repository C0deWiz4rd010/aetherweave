import { Injectable, inject } from '@angular/core';
import { RngService } from './rng.service';
import { ENEMIES } from '../data/enemies.data';
import type { EnemyInstance, Intent } from '../models';

/** Chooses enemy intents using weighted random selection over their moveset. */
@Injectable({ providedIn: 'root' })
export class EnemyAiService {
  private readonly rng = inject(RngService);

  /** Picks the next move, avoiding an immediate repeat of the same move when possible. */
  chooseIntent(enemy: EnemyInstance): { intent: Intent; moveIndex: number } {
    const def = ENEMIES[enemy.defId];
    const moves = def.moves;
    const candidates = moves
      .map((m, i) => ({ value: i, weight: m.weight ?? 1 }))
      .filter((c) => moves.length === 1 || c.value !== enemy.moveIndex);

    const pool = candidates.length ? candidates : moves.map((_, i) => ({ value: i, weight: 1 }));
    const moveIndex = this.rng.weighted(pool);
    return { intent: { ...moves[moveIndex].intent }, moveIndex };
  }
}
