export type NodeType =
  | 'combat'
  | 'elite'
  | 'event'
  | 'shop'
  | 'rest'
  | 'treasure'
  | 'boss';

export interface MapNode {
  id: string;
  type: NodeType;
  row: number;
  col: number;
  /** Node ids in the next row this node connects to. */
  next: string[];
  x: number;
  y: number;
}

export interface GameMap {
  act: number;
  nodes: MapNode[];
  rows: string[][];
}
