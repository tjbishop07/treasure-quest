import {
  Tile,
  TileType,
  Row,
  GameBoard,
  Coordinate,
  TileStatus,
} from "./types.js";

const BOARD_SIZE = 10;
const INITIAL_AIR_SUPPLY = 1500;
const LAND_PROBABILITY = 0.25; // 1/4 chance
const TREASURE_PROBABILITY = 0.1; // 1/10 chance
const MIN_DEPTH = 10;
const MAX_DEPTH = 100;
const MIN_TREASURE = 10;
const MAX_TREASURE = 100;

const getRandomNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const _randomTreasureValue = (): number => {
  return getRandomNumberInRange(MIN_TREASURE, MAX_TREASURE);
};

const _generateTile = (coordinates: Coordinate): Tile => {
  const tileType =
    Math.random() < LAND_PROBABILITY ? TileType.Land : TileType.Sea;
  const depth =
    tileType === TileType.Sea
      ? getRandomNumberInRange(MIN_DEPTH, MAX_DEPTH)
      : 0;
  const hasTreasure =
    tileType === TileType.Sea && Math.random() < TREASURE_PROBABILITY;
  const treasureValue = hasTreasure ? _randomTreasureValue() : 0;

  return {
    coordinates,
    type: tileType,
    depth,
    treasureValue,
    status: TileStatus.Unexplored,
  };
};

const _generateRow = (rowNumber: number): Row => ({
  tiles: Array.from({ length: BOARD_SIZE }, (_, i) =>
    _generateTile({ x: rowNumber, y: i })
  ),
});

export const generateBoard = (gameNumber: string): GameBoard => ({
  rows: Array.from({ length: BOARD_SIZE }, (_, i) => _generateRow(i)),
  lastTileSelected: null,
  foundTreasureCount: 0,
  foundTreasureValue: 0,
  airSupply: INITIAL_AIR_SUPPLY,
  gameStarted: false,
  gameOver: false,
  gameNumber,
});

export const updateTileStatus = (
  gameBoard: GameBoard,
  coordinates: Coordinate,
  newStatus: TileStatus
): GameBoard => ({
  ...gameBoard,
  rows: gameBoard.rows.map((row, rowIndex) =>
    rowIndex === coordinates.x
      ? {
          ...row,
          tiles: row.tiles.map((tile) =>
            tile.coordinates.y === coordinates.y
              ? { ...tile, status: newStatus }
              : tile
          ),
        }
      : row
  ),
});

export const getTreasureCount = (gameBoard: GameBoard): number =>
  gameBoard.rows.reduce(
    (count, row) =>
      count +
      row.tiles.reduce(
        (rowCount, tile) => rowCount + (tile.treasureValue > 0 ? 1 : 0),
        0
      ),
    0
  );

const getTreasureHint = (
  lastTile: Tile,
  currentRow: Row,
  treasureValue: number
): string => {
  if (treasureValue > 0) {
    return `Sweet! You found treasure with ${treasureValue} coins.`;
  }

  const unexploredTileWithTreasure = currentRow.tiles.find(
    (tile) =>
      tile.status === TileStatus.Unexplored &&
      tile.treasureValue > 0 &&
      tile.coordinates.y !== lastTile.coordinates.y
  );

  let hint = "You did not find any treasure down here.";

  if (unexploredTileWithTreasure) {
    const direction =
      unexploredTileWithTreasure.coordinates.y < lastTile.coordinates.y
        ? "west"
        : "east";
    hint += ` Off in the distance to the ${direction} you see a glimmer of light.`;
  } else {
    hint += " It's dark down here.";
  }

  return hint;
};

export const diveCompletedMessage = (
  gameBoard: GameBoard,
  treasureValue: number
): string => {
  if (!gameBoard.lastTileSelected) {
    return "Last tile not selected";
  }

  const lastTile = gameBoard.lastTileSelected;
  const currentRow = gameBoard.rows[lastTile.coordinates.x];

  return getTreasureHint(lastTile, currentRow, treasureValue);
};
