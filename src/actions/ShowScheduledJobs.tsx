import type { MenuItem } from "@devvit/public-api";

export const showScheduledJobs: MenuItem = {
  label: "Show Scheduled Jobs",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    const scheduledJobs = await context.scheduler.listJobs();
    console.log("scheduledJobs", scheduledJobs);
    ui.showToast({
      text: "Check logs to see schedule jobs. (devvit logs treasurequestgame --since=1d)",
    });
  },
};
