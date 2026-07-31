import type { ElementType } from './element.model';
import type { StatusId, StatusMap } from './status.model';

export type IntentType =
  | 'attack'
  | 'attack-debuff'
  | 'defend'
  | 'buff'
  | 'debuff'
  | 'special'
  | 'unknown';

export interface Intent {
  type: IntentType;
  damage?: number;
  hits?: number;
  block?: number;
  element?: ElementType;
  status?: { target: 'player' | 'self'; status: StatusId; amount: number };
  label?: string;
}

export interface EnemyMove {
  intent: Intent;
  /** Optional weight for weighted random move selection. */
  weight?: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  minHp: number;
  maxHp: number;
  moves: EnemyMove[];
  act: number;
  glyph: string;
  color: string;
  isElite?: boolean;
  isBoss?: boolean;
}

export interface EnemyInstance {
  uid: string;
  defId: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  aura: ElementType | null;
  statuses: StatusMap;
  intent: Intent;
  moveIndex: number;
  glyph: string;
  color: string;
  isElite: boolean;
  isBoss: boolean;
}
