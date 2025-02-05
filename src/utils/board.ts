import {
  Tile,
  TileType,
  Row,
  GameBoard,
  Coordinate,
  TileStatus,
} from "./types.js";

export const diveCompletedMessage = (
  gameBoard: GameBoard,
  treasureValue: number
): string => {
  if (!gameBoard.lastTileSelected) {
    return "Last tile not selected";
  }

  const lastTile = gameBoard.lastTileSelected;
  const currentRow = gameBoard.rows[lastTile.coordinates.x];

  var hint: string = `You found ${treasureValue} coins.`;

  if (treasureValue > 0) return hint;
  var hintAdded: Boolean = false;

  currentRow.tiles.forEach((tile: Tile) => {
    if (hintAdded) return;
    if (
      tile.status === TileStatus.Unexplored &&
      tile.treasureValue > 0 &&
      tile.coordinates !== lastTile.coordinates
    ) {
      if (tile.coordinates.y < lastTile.coordinates.y) {
        hint += " Off in the distance to the west you see a glimmer of light.";
        hintAdded = true;
      }
      if (tile.coordinates.y > lastTile.coordinates.y) {
        hint = " Off in the distance to the east you see a glimmer of light.";
        hintAdded = true;
      }
    }
  });

  if (hintAdded) return hint;
  return (hint += " It's dark down here.");
};

export const getTreasureCount = (gameBoard: GameBoard): number => {
  let treasureCount = 0;
  gameBoard.rows.forEach((row: { tiles: any[] }) => {
    row.tiles.forEach((tile) => {
      if (tile.treasureValue > 0) {
        treasureCount++;
      }
    });
  });
  return treasureCount;
};

export const generateBoard = (gameNumber: string): GameBoard => {
  const rowCount = 10;
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(_generateRow(i));
  }
  return {
    rows,
    lastTileSelected: null,
    foundTreasureCount: 0,
    foundTreasureValue: 0,
    airSupply: 1500,
    gameStarted: false,
    gameOver: false,
    gameNumber: gameNumber,
  };
};

export const updateTileStatus = (
  gameBoard: GameBoard,
  coordinates: Coordinate,
  newStatus: TileStatus
): GameBoard => {
  const updatedRows = gameBoard.rows.map((row: { tiles: any[] }) => {
    const updatedTiles = row.tiles.map((tile) => {
      if (
        tile.coordinates.x === coordinates.x &&
        tile.coordinates.y === coordinates.y
      ) {
        return { ...tile, status: newStatus };
      }
      return tile;
    });
    return { ...row, tiles: updatedTiles };
  });

  return { ...gameBoard, rows: updatedRows };
};

const _generateRow = (rowNumber: number): Row => {
  const columnCount = 10;
  const columns: Tile[] = [];

  for (let i = 0; i < columnCount; i++) {
    columns.push(_generateTile({ x: rowNumber, y: i }));
  }

  return { tiles: columns };
};

const _generateTile = (coordinates: Coordinate): Tile => {
  let minDepth = 10;
  let maxDepth = 100;

  const tileType: TileType =
    Math.floor(Math.random() * 4) == 0 ? TileType.Land : TileType.Sea;

  const randomDepth: number =
    Math.floor(Math.random() * (+maxDepth + 1 - +minDepth)) + +minDepth;

  const hasTreasure: boolean = Math.floor(Math.random() * 10) == 0;

  return {
    coordinates: coordinates,
    type: tileType,
    depth: tileType === TileType.Sea ? randomDepth : 0,
    treasureValue:
      tileType === TileType.Sea
        ? hasTreasure
          ? _randomTreasureValue()
          : 0
        : 0,
    status: TileStatus.Unexplored,
  };
};

const _randomTreasureValue = (): number => {
  return Math.floor(Math.random() * (100 - 10)) + 10;
};
