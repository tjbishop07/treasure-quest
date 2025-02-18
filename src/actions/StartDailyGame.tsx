import { MenuItem } from "@devvit/public-api";

export const startDailyGame: MenuItem = {
  label: "Start Daily Game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;

    try {
      const scheduledJobs = await context.scheduler.listJobs();
      for (const job of scheduledJobs) {
        await context.scheduler.cancelJob(job.id);
      }

      const jobId = await context.scheduler.runJob({
        cron: "00 3 * * *", // 3am UTC
        name: "daily_game",
      });

      await context.redis.set("dailyGameJobId", jobId);
    } catch (e) {
      console.log("error scheduling game", e);
      throw e;
    }

    ui.showToast({ text: "Daily Game scheduled!" });
  },
};
