export type Tile = {
  coordinates: Coordinate;
  type: TileType;
  depth: number;
  treasureValue: number;
  status: TileStatus;
};

export type Row = {
  tiles: Tile[];
};

export type Coordinate = { x: number; y: number };

export type GameBoard = {
  rows: Row[];
  lastTileSelected: Tile | null;
  foundTreasureCount: number;
  foundTreasureValue: number;
  airSupply: number;
  gameStarted: boolean;
  gameOver: boolean;
  gameOverMessage?: string;
};

export enum TileType {
  Land,
  Sea,
}

export enum TileStatus {
  Unexplored,
  Explored,
  Treasure,
}

export type SystemMessage = {
  title?: string;
  message: string;
  image?: string;
  type: SystemMessageType;
  dismissable: boolean;
  buttonLabel?: string;
};

export enum SystemMessageType {
  Error,
  Info,
}
