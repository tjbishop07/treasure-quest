import { Devvit } from "@devvit/public-api";
import { Game } from "./components/Game.js";
import { scheduleGame } from "./cron/ScheduleGame.js";
import { showScheduledJobs } from "./actions/ShowScheduledJobs.js";
import { resetDailyGameNumber } from "./actions/ResetDailyGameNumber.js";
import { cancelScheduledJobs } from "./actions/CancelScheduledJobs.js";
import { startDailyGame } from "./actions/StartDailyGame.js";
import { startTestGame } from "./actions/StartTestGame.js";

/*
 * Plugins
 */

Devvit.configure({
  redditAPI: true,
  media: true,
});

/*
 * Scheduled Jobs
 */

Devvit.addSchedulerJob(scheduleGame);

/*
 * Menu Actions
 */

Devvit.addMenuItem(showScheduledJobs);
Devvit.addMenuItem(resetDailyGameNumber);
Devvit.addMenuItem(cancelScheduledJobs);
Devvit.addMenuItem(startDailyGame);
Devvit.addMenuItem(startTestGame);

/*
 * Custom Post
 */

Devvit.addCustomPostType({
  name: "Treasure Quest",
  description:
    "Can you find all of the sunken treasure before your air runs out? See how much loot you find and try to beat your high score!",
  height: "tall",
  render: Game,
});

export default Devvit;
