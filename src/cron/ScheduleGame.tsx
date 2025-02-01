import type { ScheduledCronJob, ScheduledJobType } from "@devvit/public-api";
import { Devvit } from "@devvit/public-api";
import { generateDailyGameboard } from "../api/api.js";

export const scheduleGame: ScheduledJobType<ScheduledCronJob> = {
  name: "daily_game",
  onRun: async (_, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    var gameNumber = await context.redis.get("game_number");

    if (!gameNumber) {
      console.log("No game number found, starting at 0");
      await context.redis.set("game_number", "0");
    }

    gameNumber = (await context.redis.incrBy("game_number", 1)).toString();
    await generateDailyGameboard(context.redis, gameNumber);

    const resp = await context.reddit.submitPost({
      title: `Daily Treasure Quest Game #${gameNumber}`,
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
  },
};
