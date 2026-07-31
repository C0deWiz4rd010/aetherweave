import type { StatusMap } from './status.model';

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  statuses: StatusMap;
  relics: string[];
}
