import { Devvit, type MenuItem } from "@devvit/public-api";
import { Service } from "../api/Service.js";

export const startTestGame: MenuItem = {
  label: "Start Test Dive",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const service = new Service(context);
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    var gameNumber = await context.redis.get("game_number");

    if (!gameNumber) {
      console.log("No game number found, starting at 0");
      await context.redis.set("game_number", "0");
    }

    await service.generateDailyGameboard("0");

    await reddit.submitPost({
      title: `Treasure Quest Test Game #${gameNumber}`,
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });

    ui.showToast({ text: "Test game created!" });
  },
};
