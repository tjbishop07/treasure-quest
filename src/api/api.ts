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
  console.log(`Daily gameboard generated, game #${gameNumber}`);
  return newGameboard;
};

export const loadDailyGameboard = async (
  redis: RedisClient,
  gameNumber: string
): Promise<GameBoard> => {
  const storedGameboard = await redis.get(Keys.dailyGameboard(gameNumber));
  if (!storedGameboard) {
    console.log("Daily gameboard not found");
    throw new Error("Daily gameboard not found");
  }
  return JSON.parse(storedGameboard);
};

export const loadPlayerGameboard = async (
  redis: RedisClient,
  postId: string,
  currentUserName: string
): Promise<GameBoard> => {
  const storedGameboard = await redis.get(
    Keys.playerGameboard(postId, currentUserName)
  );

  var gameboardParsed: GameBoard = JSON.parse(
    storedGameboard?.toString() || "{}"
  );

  if (!gameboardParsed || !gameboardParsed.rows) {
    console.log(`Player gameboard not found for ${currentUserName}`);
    const gameNumber = await redis.get("game_number");

    if (!gameNumber) {
      console.log("Game number not found when loading player gameboard");
      throw new Error("Game number not found");
    }

    console.log(`Loading daily gameboard for game #${gameNumber}`);
    const dailyGameboard = loadDailyGameboard(redis, gameNumber);

    await redis.set(
      Keys.playerGameboard(postId, currentUserName),
      JSON.stringify(dailyGameboard)
    );

    return dailyGameboard;
  }

  console.log(
    `Loaded player gameboard for ${currentUserName}`,
    storedGameboard
  );
  return gameboardParsed;
};

export const saveGameboard = async (
  redis: RedisClient,
  postId: string,
  currentUserName: string,
  gameBoard: GameBoard
): Promise<void> => {
  redis.set(
    Keys.playerGameboard(postId, currentUserName),
    JSON.stringify(gameBoard)
  );
};
