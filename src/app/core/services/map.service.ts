import { Injectable, inject } from '@angular/core';
import { RngService } from './rng.service';
import {
  NORMAL_ENEMIES_BY_ACT,
  ELITES_BY_ACT,
  BOSS_BY_ACT,
} from '../data/enemies.data';
import type { GameMap, MapNode, NodeType } from '../models';

const WIDTH = 6;
const HEIGHT = 9;
const PATHS = 6;

/**
 * Procedurally generates a branching act map as a layered DAG. Several random
 * walks from the bottom row upward are unioned together, producing organic
 * splits and merges while guaranteeing every node is reachable.
 */
@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly rng = inject(RngService);

  generate(seed: number, act: number): GameMap {
    this.rng.seed((seed ^ (act * 0x9e3779b1)) >>> 0);

    const nodes = new Map<string, MapNode>();
    const key = (r: number, c: number) => `n${r}_${c}`;

    const ensure = (r: number, c: number): MapNode => {
      const k = key(r, c);
      let node = nodes.get(k);
      if (!node) {
        node = {
          id: k,
          type: 'combat',
          row: r,
          col: c,
          next: [],
          x: c / (WIDTH - 1),
          y: r / (HEIGHT - 1),
        };
        nodes.set(k, node);
      }
      return node;
    };

    const connect = (from: MapNode, to: MapNode) => {
      if (!from.next.includes(to.id)) from.next.push(to.id);
    };

    for (let p = 0; p < PATHS; p++) {
      let col = this.rng.int(0, WIDTH - 1);
      let prev = ensure(0, col);
      for (let r = 1; r < HEIGHT; r++) {
        let nextCol: number;
        if (r === HEIGHT - 1) {
          nextCol = Math.floor(WIDTH / 2); // all paths converge on the boss
        } else {
          const delta = this.rng.pick([-1, 0, 1]);
          nextCol = Math.min(WIDTH - 1, Math.max(0, col + delta));
        }
        const node = ensure(r, nextCol);
        connect(prev, node);
        prev = node;
        col = nextCol;
      }
    }

    // assign node types
    for (const node of nodes.values()) {
      node.type = this.rollType(node.row);
    }

    const rows: string[][] = Array.from({ length: HEIGHT }, () => []);
    for (const node of nodes.values()) rows[node.row].push(node.id);
    for (const row of rows) row.sort((a, b) => nodes.get(a)!.col - nodes.get(b)!.col);

    return { act, nodes: [...nodes.values()], rows };
  }

  private rollType(row: number): NodeType {
    if (row === 0) return 'combat';
    if (row === 1) return 'combat';
    if (row === HEIGHT - 1) return 'boss';
    if (row === HEIGHT - 2) return 'rest';
    return this.rng.weighted<NodeType>([
      { value: 'combat', weight: 45 },
      { value: 'event', weight: 20 },
      { value: 'elite', weight: 12 },
      { value: 'shop', weight: 10 },
      { value: 'treasure', weight: 8 },
      { value: 'rest', weight: 5 },
    ]);
  }

  /** Rolls the enemy group for a node, given the current act. */
  buildEncounter(type: NodeType, act: number): string[] {
    if (type === 'boss') return [BOSS_BY_ACT[act]];
    if (type === 'elite') return [this.rng.pick(ELITES_BY_ACT[act])];
    const pool = NORMAL_ENEMIES_BY_ACT[act];
    const count = this.rng.bool(0.45) ? 2 : 1;
    return Array.from({ length: count }, () => this.rng.pick(pool));
  }
}
