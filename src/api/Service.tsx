import type { RedisClient } from "@devvit/public-api";
import { GameBoard, LeaderboardItem } from "../utils/types.js";
import { generateBoard } from "../utils/board.js";

const Keys = {
  playerGameboard: (postId: string, username: string) =>
    `playerGameboard:${postId}:${username}`,
  dailyGameboard: (gameNumber: string) => `dailyGameboard:${gameNumber}}`,
  dailyLeaderboard: (gameNumber: string) => `leaderboard:daily:${gameNumber}`,
} as const;

export class Service {
  readonly redis: RedisClient;

  /**
   * Creates a new Service instance
   * @param context - The context object containing Redis client
   */
  constructor(context: { redis: RedisClient }) {
    this.redis = context.redis;
  }

  /**
   * Retrieves the daily leaderboard for a specific game
   * @param gameNumber - The unique identifier for the daily game
   * @returns Promise<LeaderboardItem[]> - The daily leaderboard
   */
  async getDailyLeaderboard(gameNumber: string): Promise<LeaderboardItem[]> {
    const leaderboard = await this.redis.zRange(
      Keys.dailyLeaderboard(gameNumber),
      0,
      1000,
      {
        by: "score",
        reverse: true,
      }
    );
    return leaderboard;
  }

  /**
   * Updates the daily leaderboard with a player's score
   * @param currentUserName - The username of the current player
   * @param finalScore - The score achieved in the current game
   * @param gameNumber - The unique identifier for the daily game
   */
  async updateDailyLeaderboard(
    currentUserName: string,
    finalScore: number,
    gameNumber: string
  ): Promise<void> {
    if (!currentUserName || !gameNumber) {
      throw new Error("Invalid input");
    }
    await this.redis.zAdd(Keys.dailyLeaderboard(gameNumber), {
      member: currentUserName,
      score: finalScore,
    });
  }

  /**
   * Updates the global leaderboard with a player's score
   * @param finalScore - The score achieved in the current game
   * @param currentUserName - The username of the current player
   *
   * This function:
   * 1. Gets the player's existing score from the global leaderboard (if any)
   * 2. Adds the new score to their existing score
   * 3. Updates the sorted set in Redis with their new cumulative score
   */
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

  /**
   * Generates a new daily gameboard and stores it in Redis
   * @param gameNumber - The unique identifier for the daily game
   * @returns Promise<GameBoard> - The newly generated gameboard
   */
  async generateDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const newGameboard = generateBoard(gameNumber);
    await this.redis.set(
      Keys.dailyGameboard(gameNumber),
      JSON.stringify(newGameboard)
    );
    return newGameboard;
  }

  /**
   * Retrieves the daily gameboard from Redis
   * @param gameNumber - The unique identifier for the daily game
   * @returns Promise<GameBoard> - The stored daily gameboard
   * @throws Error if the daily gameboard is not found
   */
  async loadDailyGameboard(gameNumber: string): Promise<GameBoard> {
    const storedGameboard = await this.redis.get(
      Keys.dailyGameboard(gameNumber)
    );
    if (!storedGameboard) {
      throw new Error("Daily gameboard not found");
    }
    return JSON.parse(storedGameboard);
  }

  /**
   * Loads or creates a player's gameboard for a specific post
   * @param currentUserName - The username of the player
   * @param postId - The ID of the post associated with the game
   * @returns Promise<GameBoard> - The player's gameboard
   * @throws Error if username or postId is missing, or if game number is not found
   */
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

  /**
   * Saves a player's gameboard state to Redis
   * @param currentUserName - The username of the player
   * @param postId - The ID of the post associated with the game
   * @param gameBoard - The gameboard state to save
   * @throws Error if username is missing or empty
   */
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
