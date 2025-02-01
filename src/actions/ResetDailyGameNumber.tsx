import type { MenuItem } from "@devvit/public-api";

export const resetDailyGameNumber: MenuItem = {
  label: "Reset Daily Game Number",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    console.log("Resetting game number...");

    try {
      await context.redis.set("game_number", "0");
      console.log("Game number reset to 0");
    } catch (e) {
      console.log("error resetting game number:", e);
      throw e;
    }

    ui.showToast({
      text: "Game number reset! Check logs for more information.",
    });
  },
};
