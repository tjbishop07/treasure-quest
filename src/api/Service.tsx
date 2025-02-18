import type { RedisClient } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { generateBoard } from "../utils/board.js";

const Keys = {
  playerGameboard: (postId: string, username: string) =>
    `playerGameboard:${postId}:${username}`,
  dailyGameboard: (gameNumber: string) => `dailyGameboard:${gameNumber}}`,
} as const;

export class Service {
  readonly redis: RedisClient;

  constructor(context: { redis: RedisClient }) {
    this.redis = context.redis;
  }

  async updateGlobalLeaderboard(
    finalScore: number,
    currentUserName: string
  ): Promise<void> {
    const leaderboardKey = `leaderboard:global`;
    const currentScore = await this.redis.zScore(
      leaderboardKey,
      currentUserName
    );
    const newScore = (currentScore ? Number(currentScore) : 0) + finalScore;
    await this.redis.zAdd(leaderboardKey, {
      member: currentUserName,
      score: newScore,
    });
  }

  async generateDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const newGameboard = generateBoard(gameNumber);
    await this.redis.set(
      Keys.dailyGameboard(gameNumber),
      JSON.stringify(newGameboard)
    );
    return newGameboard;
  }

  async loadDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const storedGameboard = await this.redis.get(
      Keys.dailyGameboard(gameNumber)
    );
    if (!storedGameboard) {
      throw new Error("Daily gameboard not found");
    }
    return JSON.parse(storedGameboard);
  }

  async loadPlayerGameboard(
    currentUserName: string | null,
    postId: string | null
  ): Promise<GameBoard> {
    if (!currentUserName || !postId)
      throw new Error("Could not load player gameboard");

    const gameNumber = await this.redis.get("game_number");

    if (!gameNumber) {
      throw new Error("Game number not found");
    }

    const storedGameboard = await this.redis.get(
      Keys.playerGameboard(postId, currentUserName)
    );

    var gameboardParsed: GameBoard = JSON.parse(
      storedGameboard?.toString() || "{}"
    );

    if (!gameboardParsed || !gameboardParsed.rows) {
      const dailyGameboard = await this.loadDailyGameboard(gameNumber);
      await this.redis.set(
        Keys.playerGameboard(postId, currentUserName),
        JSON.stringify(dailyGameboard)
      );

      return dailyGameboard;
    }

    return gameboardParsed;
  }

  async saveGameboard(
    currentUserName: string,
    postId: string,
    gameBoard: GameBoard
  ): Promise<void> {
    if (!currentUserName || currentUserName.length == 0)
      throw new Error("User not found");

    await this.redis.set(
      Keys.playerGameboard(postId, currentUserName),
      JSON.stringify(gameBoard)
    );
  }
}
