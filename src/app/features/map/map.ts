import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RunService } from '../../core/services/run.service';
import { GameStore } from '../../core/services/game-store';
import type { MapNode, NodeType } from '../../core/models';

const NODE_ICON: Record<NodeType, string> = {
  combat: '⚔️',
  elite: '💀',
  event: '❓',
  shop: '🛒',
  rest: '🔥',
  treasure: '🎁',
  boss: '👑',
};

const NODE_LABEL: Record<NodeType, string> = {
  combat: 'Battle',
  elite: 'Elite',
  event: 'Unknown',
  shop: 'Shop',
  rest: 'Rest',
  treasure: 'Treasure',
  boss: 'Boss',
};

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

@Component({
  selector: 'app-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class GameMapView {
  protected readonly run = inject(RunService);
  protected readonly store = inject(GameStore);

  protected readonly icon = NODE_ICON;
  protected readonly label = NODE_LABEL;

  protected readonly nodes = computed(() => this.run.map()?.nodes ?? []);

  protected readonly edges = computed<Edge[]>(() => {
    const map = this.run.map();
    if (!map) return [];
    const byId = this.run.nodeMap();
    const available = this.run.available();
    const edges: Edge[] = [];
    for (const node of map.nodes) {
      for (const nextId of node.next) {
        const to = byId.get(nextId);
        if (!to) continue;
        edges.push({
          x1: node.x * 100,
          y1: (1 - node.y) * 100,
          x2: to.x * 100,
          y2: (1 - to.y) * 100,
          active: available.includes(nextId),
        });
      }
    }
    return edges;
  });

  protected posLeft(n: MapNode): string {
    return `${n.x * 100}%`;
  }
  protected posTop(n: MapNode): string {
    return `${(1 - n.y) * 100}%`;
  }

  protected isAvailable(id: string): boolean {
    return this.run.isAvailable(id);
  }
  protected isVisited(id: string): boolean {
    return this.run.visited().includes(id);
  }
  protected isCurrent(id: string): boolean {
    return this.run.currentNodeId() === id;
  }

  protected choose(id: string): void {
    this.run.chooseNode(id);
  }
}
