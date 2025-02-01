import type { MenuItem } from "@devvit/public-api";

export const startDailyGame: MenuItem = {
  label: "Start Daily Game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    console.log("Setting up schedule game...");

    try {
      console.log("Cancelling previously scheduled game...");
      const scheduledJobs = await context.scheduler.listJobs();
      for (const job of scheduledJobs) {
        await context.scheduler.cancelJob(job.id);
        console.log("Job cancelled:", job.id);
      }

      const jobId = await context.scheduler.runJob({
        cron: "00 3 * * *", // 3am UTC
        name: "daily_game",
      });

      await context.redis.set("dailyGameJobId", jobId);
      console.log("Job scheduled:", jobId);
    } catch (e) {
      console.log("error scheduling game", e);
      throw e;
    }

    ui.showToast({ text: "Daily Game scheduled!" });
  },
};
