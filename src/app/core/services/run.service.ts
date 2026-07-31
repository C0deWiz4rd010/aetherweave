import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from './game-store';
import { MapService } from './map.service';
import { RngService } from './rng.service';
import { EVENTS } from '../data/events.data';
import { FINDABLE_RELIC_IDS } from '../data/relics.data';
import type { EventDef, GameMap, MapNode } from '../models';

/**
 * Drives progression across an act: which map node the player is on, which
 * nodes are reachable next, and the routing that follows from entering a node.
 */
@Injectable({ providedIn: 'root' })
export class RunService {
  private readonly store = inject(GameStore);
  private readonly mapService = inject(MapService);
  private readonly rng = inject(RngService);
  private readonly router = inject(Router);

  readonly map = signal<GameMap | null>(null);
  readonly currentNodeId = signal<string | null>(null);
  readonly visited = signal<string[]>([]);
  readonly available = signal<string[]>([]);
  readonly currentEvent = signal<EventDef | null>(null);

  readonly nodeMap = computed(() => {
    const m = this.map();
    const map = new Map<string, MapNode>();
    if (m) for (const n of m.nodes) map.set(n.id, n);
    return map;
  });

  startAct(): void {
    const map = this.mapService.generate(this.store.seed(), this.store.act());
    this.map.set(map);
    this.currentNodeId.set(null);
    this.visited.set([]);
    this.available.set(map.rows[0]);
    this.store.setPhase('map');
  }

  isAvailable(id: string): boolean {
    return this.available().includes(id);
  }

  chooseNode(id: string): void {
    const node = this.nodeMap().get(id);
    if (!node || !this.isAvailable(id)) return;

    this.currentNodeId.set(id);
    this.visited.update((v) => [...v, id]);
    this.available.set([]);
    this.store.floor.update((f) => f + 1);

    switch (node.type) {
      case 'combat':
      case 'elite':
      case 'boss':
        this.store.encounter.set(this.mapService.buildEncounter(node.type, this.store.act()));
        this.store.setPhase('combat');
        this.router.navigate(['/combat']);
        break;
      case 'event':
        this.currentEvent.set(this.rng.pick(EVENTS));
        this.store.setPhase('event');
        this.router.navigate(['/event']);
        break;
      case 'shop':
        this.store.setPhase('shop');
        this.router.navigate(['/shop']);
        break;
      case 'rest':
        this.store.setPhase('rest');
        this.router.navigate(['/rest']);
        break;
      case 'treasure':
        this.grantTreasure();
        this.advance();
        break;
    }
  }

  private grantTreasure(): void {
    const owned = this.store.relics();
    const pool = FINDABLE_RELIC_IDS.filter((id) => !owned.includes(id));
    if (pool.length) this.store.addRelic(this.rng.pick(pool));
    this.store.addGold(this.rng.int(15, 30));
  }

  /** Called after a node is resolved to open the next reachable nodes. */
  advance(): void {
    const id = this.currentNodeId();
    const node = id ? this.nodeMap().get(id) : null;

    if (node?.type === 'boss') {
      if (this.store.act() < 3) {
        this.store.act.update((a) => a + 1);
        this.store.heal(Math.round(this.store.maxHp() * 0.25));
        this.startAct();
        this.router.navigate(['/map']);
      } else {
        this.store.recordVictory();
        this.store.setPhase('victory');
        this.router.navigate(['/result']);
      }
      return;
    }

    this.available.set(node ? node.next : []);
    this.store.setPhase('map');
    this.router.navigate(['/map']);
  }
}
