import type { MenuItem } from "@devvit/public-api";

export const cancelScheduledJobs: MenuItem = {
  label: "Cancel All Daily Games",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    console.log("Canceling scheduled game...");

    try {
      const scheduledJobs = await context.scheduler.listJobs();
      for (const job of scheduledJobs) {
        await context.scheduler.cancelJob(job.id);
        console.log("Job cancelled:", job.id);
      }
    } catch (e) {
      console.log("error cancelling game schedule:", e);
      throw e;
    }

    ui.showToast({ text: "Game scheduled cancelled!" });
  },
};
