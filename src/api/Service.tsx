import type { RedisClient } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { generateBoard } from "../utils/board.js";

const REDIS_KEYS = {
  playerGameboard: (postId: string, username: string) =>
    `playerGameboard:${postId}:${username}`,
  dailyGameboard: (gameNumber: string) => `dailyGameboard:${gameNumber}`,
  globalLeaderboard: "leaderboard:global",
  gameNumber: "game_number",
} as const;

export class Service {
  constructor(private readonly redis: RedisClient) {}

  async updateGlobalLeaderboard(
    score: number,
    username: string
  ): Promise<void> {
    const currentScore = await this.redis.zScore(
      REDIS_KEYS.globalLeaderboard,
      username
    );
    const newScore = (currentScore ? Number(currentScore) : 0) + score;
    await this.redis.zAdd(REDIS_KEYS.globalLeaderboard, {
      member: username,
      score: newScore,
    });
  }

  async generateDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const gameBoard = generateBoard(gameNumber);
    await this.redis.set(
      REDIS_KEYS.dailyGameboard(gameNumber),
      JSON.stringify(gameBoard)
    );
    return gameBoard;
  }

  async loadDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const storedGameboard = await this.redis.get(
      REDIS_KEYS.dailyGameboard(gameNumber)
    );
    if (!storedGameboard) {
      throw new Error("Daily gameboard not found");
    }
    return JSON.parse(storedGameboard);
  }

  async loadPlayerGameboard(
    username: string | null,
    postId: string | null
  ): Promise<GameBoard> {
    if (!username || !postId) {
      throw new Error(
        "Could not load player gameboard - missing username or postId"
      );
    }

    const gameNumber = await this.redis.get(REDIS_KEYS.gameNumber);
    if (!gameNumber) {
      throw new Error("Game number not found");
    }

    const storedGameboard = await this.redis.get(
      REDIS_KEYS.playerGameboard(postId, username)
    );

    const parsedGameboard: GameBoard = storedGameboard
      ? JSON.parse(storedGameboard)
      : null;

    if (!parsedGameboard?.rows) {
      const dailyGameboard = await this.loadDailyGameboard(gameNumber);
      await this.saveGameboard(username, postId, dailyGameboard);
      return dailyGameboard;
    }

    return parsedGameboard;
  }

  async saveGameboard(
    username: string,
    postId: string,
    gameBoard: GameBoard
  ): Promise<void> {
    if (!username) {
      throw new Error("Cannot save gameboard - username not provided");
    }

    await this.redis.set(
      REDIS_KEYS.playerGameboard(postId, username),
      JSON.stringify(gameBoard)
    );
  }
}
