import type { RedisClient } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { generateBoard } from "../utils/board.js";

const Keys = {
  gameboard: (postId: string, username: string) =>
    `gameBoard:${postId}:${username}`,
} as const;

export const loadGameboard = async (
  redis: RedisClient,
  postId: string,
  currentUserName: string
): Promise<GameBoard> => {
  const storedGameboard = await redis.get(
    Keys.gameboard(postId, currentUserName)
  );
  if (!storedGameboard) {
    const newGameboard = generateBoard();
    await redis.set(
      Keys.gameboard(postId, currentUserName),
      JSON.stringify(newGameboard)
    );
    return newGameboard;
  }
  return JSON.parse(storedGameboard);
};

export const saveGameboard = async (
  redis: RedisClient,
  postId: string,
  currentUserName: string,
  gameBoard: GameBoard
): Promise<void> => {
  redis.set(Keys.gameboard(postId, currentUserName), JSON.stringify(gameBoard));
};
