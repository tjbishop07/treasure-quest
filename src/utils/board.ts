/**
 * Board utilities for the Treasure Quest game
 * Handles board generation, tile updates, and game messages
 */

import {
  Tile,
  TileType,
  Row,
  GameBoard,
  Coordinate,
  TileStatus,
} from "./types.js";

// Game configuration constants
const BOARD_SIZE = 10;
const INITIAL_AIR_SUPPLY = 1500;
const LAND_PROBABILITY = 0.25; // 1/4 chance
const TREASURE_PROBABILITY = 0.1; // 1/10 chance
const MIN_DEPTH = 10;
const MAX_DEPTH = 100;
const MIN_TREASURE = 10;
const MAX_TREASURE = 100;

/**
 * Returns a random integer between min and max (inclusive)
 */
const getRandomNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random treasure value between MIN_TREASURE and MAX_TREASURE
 */
const _randomTreasureValue = (): number => {
  return getRandomNumberInRange(MIN_TREASURE, MAX_TREASURE);
};

/**
 * Generates a single tile with random properties based on game rules
 * @param coordinates - The x,y position of the tile on the board
 */
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

/**
 * Generates a row of tiles for the game board
 * @param rowNumber - The index of the row being generated
 */
const _generateRow = (rowNumber: number): Row => ({
  tiles: Array.from({ length: BOARD_SIZE }, (_, i) =>
    _generateTile({ x: rowNumber, y: i })
  ),
});

/**
 * Generates a new game board with the given game number
 * @param gameNumber - Unique identifier for this game instance
 */
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

/**
 * Updates the status of a specific tile on the game board
 * @param gameBoard - Current game board state
 * @param coordinates - Position of tile to update
 * @param newStatus - New status to apply to the tile
 */
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

/**
 * Counts total number of treasure tiles on the board
 * @param gameBoard - Current game board state
 */
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

/**
 * Generates a hint message based on treasure discovery and nearby treasures
 * @param lastTile - The most recently explored tile
 * @param currentRow - The row containing the last explored tile
 * @param treasureValue - Value of treasure found, if any
 */
export const getTreasureHint = (
  lastTile: Tile,
  currentRow: Row,
  treasureValue: number
): string => {
  if (treasureValue > 0) {
    return `Sweet! You found treasure!`;
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
