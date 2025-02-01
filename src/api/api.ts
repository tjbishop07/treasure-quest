import type { RedisClient } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { generateBoard } from "../utils/board.js";

const Keys = {
  playerGameboard: (postId: string, username: string) =>
    `playerGameboard:${postId}:${username}`,
  dailyGameboard: (gameNumber: string) => `dailyGameboard:${gameNumber}}`,
} as const;

export const generateDailyGameboard = async (
  redis: RedisClient,
  gameNumber: string
): Promise<GameBoard> => {
  const newGameboard = generateBoard(gameNumber);
  await redis.set(
    Keys.dailyGameboard(gameNumber),
    JSON.stringify(newGameboard)
  );
  return newGameboard;
};

export const loadDailyGameboard = async (
  redis: RedisClient,
  gameNumber: string
): Promise<GameBoard> => {
  const storedGameboard = await redis.get(Keys.dailyGameboard(gameNumber));
  if (!storedGameboard) {
    throw new Error("Daily gameboard not found");
  }
  return JSON.parse(storedGameboard);
};

export const loadPlayerGameboard = async (
  redis: RedisClient,
  currentUserName: string,
  postId: string
): Promise<GameBoard> => {
  if (!currentUserName || currentUserName.length == 0)
    throw new Error("User not found");

  const gameNumber = await redis.get("game_number");

  if (!gameNumber) {
    throw new Error("Game number not found");
  }

  const storedGameboard = await redis.get(
    Keys.playerGameboard(postId, currentUserName)
  );

  var gameboardParsed: GameBoard = JSON.parse(
    storedGameboard?.toString() || "{}"
  );

  if (!gameboardParsed || !gameboardParsed.rows) {
    const dailyGameboard = loadDailyGameboard(redis, gameNumber);
    await redis.set(
      Keys.playerGameboard(postId, currentUserName),
      JSON.stringify(dailyGameboard)
    );

    return dailyGameboard;
  }

  return gameboardParsed;
};

export const saveGameboard = async (
  redis: RedisClient,
  currentUserName: string,
  postId: string,
  gameBoard: GameBoard
): Promise<void> => {
  if (!currentUserName || currentUserName.length == 0)
    throw new Error("User not found");

  redis.set(
    Keys.playerGameboard(postId, currentUserName),
    JSON.stringify(gameBoard)
  );
};
