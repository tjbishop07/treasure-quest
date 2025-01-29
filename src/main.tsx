import { Devvit, useState, useInterval } from "@devvit/public-api";
import {
  Tile,
  Row,
  TileType,
  TileStatus,
  GameBoard,
  SystemMessage,
  SystemMessageType,
} from "./utils/types.js";
import {
  generateDailyGameboard,
  loadPlayerGameboard,
  saveGameboard,
} from "./api/api.js";
import { GameBoardTile } from "./components/GameBoardTile.js";
import {
  diveCompletedMessage,
  getTreasureCount,
  updateTileStatus,
} from "./utils/board.js";
import {
  diveErrorMessage,
  startupMessage,
  tileSelectionErrorMessage,
  tileExploredMessage,
} from "./utils/messages.js";
import { Modal } from "./components/Modal.js";
import { DiveProgress } from "./components/DiveProgress.js";
import { Compass } from "./components/Compass.js";
import { Header } from "./components/Header.js";
import { GameOver } from "./components/GameOver.js";

Devvit.configure({
  redditAPI: true,
  media: true,
});

Devvit.addSchedulerJob({
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
    console.log("posted resp", JSON.stringify(resp));
  },
});

Devvit.addMenuItem({
  label: "Show Scheduled Jobs",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    const scheduledJobs = await context.scheduler.listJobs();
    console.log("scheduledJobs", scheduledJobs);
    ui.showToast({ text: "Check logs to see schedule jobs." });
  },
});

Devvit.addMenuItem({
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
    ui.showToast({ text: "Game number reset!" });
  },
});

Devvit.addMenuItem({
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
});

Devvit.addMenuItem({
  label: "Start Daily Game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    console.log("Setting up schedule game...");
    try {
      const jobId = await context.scheduler.runJob({
        cron: "30 3 * * *",
        name: "daily_game",
      });
      await context.redis.set("dailyGameJobId", jobId);
      console.log("Job scheduled:", jobId);
    } catch (e) {
      console.log("error scheduling game", e);
      throw e;
    }
    ui.showToast({ text: "Game scheduled!" });
  },
});

Devvit.addMenuItem({
  label: "Start Test Dive",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    var gameNumber = await context.redis.get("game_number");

    if (!gameNumber) {
      console.log("No game number found, starting at 0");
      await context.redis.set("game_number", "0");
    }

    await generateDailyGameboard(context.redis, "0");

    await reddit.submitPost({
      title: `Treasure Quest Test Game #${gameNumber}`,
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: "Game created!" });
  },
});

const App: Devvit.CustomPostComponent = (context) => {
  const [currentUserName] = useState<string | null>(async () => {
    if (!context.userId) {
      return null;
    }
    const user = await context.reddit.getCurrentUser();
    return user?.username || "";
  });

  const [gameBoard, setGameBoard] = useState<GameBoard>(async () => {
    const gameBoard = await loadPlayerGameboard(
      context.redis,
      currentUserName!
    );
    return gameBoard;
  });

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const [diveProgress, setDiveProgress] = useState<number>(0);
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(
    () => {
      if (gameBoard.gameStarted) return null;
      return {
        title: "There's hidden treasure nearby!",
        message: startupMessage,
        image: "treasure-quest-logo.png",
        type: SystemMessageType.Info,
        dismissable: true,
        buttonLabel: "Start Exploring!",
      };
    }
  );

  const diveInterval = useInterval(async () => {
    setDiveProgress((prev) => {
      if (prev >= selectedTile!.depth) {
        diveInterval.stop();
        setIsDiving(false);
        _analyzeDiveResults();
        return 0;
      }
      return prev + 1;
    });
  }, 100);

  const _analyzeDiveResults = async () => {
    const updateGameBoard = updateTileStatus(
      gameBoard!,
      selectedTile!.coordinates,
      TileStatus.Explored
    );

    if (selectedTile?.treasureValue && selectedTile.treasureValue > 0) {
      updateGameBoard.foundTreasureCount++;
      updateGameBoard.foundTreasureValue += selectedTile.treasureValue;
    }

    updateGameBoard.lastTileSelected = selectedTile;
    updateGameBoard.airSupply -= selectedTile!.depth;
    updateGameBoard.gameStarted = true;

    if (updateGameBoard.airSupply <= 0) {
      updateGameBoard.gameOverMessage = `OH NO! You ran out of air!`;
      updateGameBoard.gameOver = true;
    } else {
      if (
        updateGameBoard.foundTreasureCount === getTreasureCount(updateGameBoard)
      ) {
        updateGameBoard.gameOverMessage = `You found all the treasure!`;
        updateGameBoard.gameOver = true;
      } else {
        const treasureValue = selectedTile?.treasureValue || 0;
        setSystemMessage({
          title: "Dive Complete!",
          message: diveCompletedMessage(updateGameBoard, treasureValue),
          type: SystemMessageType.Info,
          dismissable: true,
        });
      }
    }

    await saveGameboard(context.redis, currentUserName!, updateGameBoard);

    setGameBoard(updateGameBoard);
  };

  const _dive = async (): Promise<void> => {
    if (!selectedTile) {
      setSystemMessage({
        message: diveErrorMessage,
        type: SystemMessageType.Error,
        dismissable: true,
      });
      return;
    }

    setIsDiving(true);
    diveInterval.start();
  };

  const _renderTreasureBoxes = (): JSX.Element => {
    const notFoundTreasureCount =
      getTreasureCount(gameBoard) - gameBoard.foundTreasureCount;
    const foundCoins = [];
    const notFoundCoins = [];
    for (let i = 0; i < gameBoard.foundTreasureCount; i++) {
      foundCoins.push(<icon name="coins" color="yellow" size="xsmall" />);
    }
    for (let i = 0; i < notFoundTreasureCount; i++) {
      notFoundCoins.push(
        <icon name="coins" color="rgba(255,255,255,.25)" size="xsmall" />
      );
    }
    return [...foundCoins, ...notFoundCoins];
  };

  return (
    <zstack width="100%" height="100%" alignment="top center">
      <image
        url="bg.jpg"
        imageWidth={770}
        imageHeight={450}
        width={100}
        height={100}
        resizeMode="cover"
        description="game background"
      />
      {gameBoard && (
        <vstack>
          <spacer size="medium" />
          <zstack
            backgroundColor="#131f23"
            padding="medium"
            height="100%"
            alignment="top center"
            cornerRadius="medium"
          >
            <vstack
              alignment="center top"
              height="100%"
              width="100%"
              gap="small"
            >
              <Header gameBoard={gameBoard} />

              <vstack>
                {gameBoard.rows.map((row: Row) => {
                  const tiles: Tile[] = row.tiles;
                  return (
                    <hstack>
                      {tiles.map((tile: Tile) =>
                        GameBoardTile({
                          selected: selectedTile === tile,
                          type: tile.type,
                          status: tile.status,
                          hasTreasure: tile.treasureValue > 0,
                          depth: tile.depth,
                          onPress: async () => {
                            if (tile.type === TileType.Land) {
                              setSystemMessage({
                                message: tileSelectionErrorMessage,
                                type: SystemMessageType.Error,
                                dismissable: true,
                              });
                              setSelectedTile(null);
                              return;
                            }
                            if (tile.status === TileStatus.Explored) {
                              setSystemMessage({
                                message: tileExploredMessage(
                                  tile.treasureValue
                                ),
                                type: SystemMessageType.Error,
                                dismissable: true,
                              });
                              setSelectedTile(null);
                              return;
                            }
                            setSystemMessage(null);
                            setSelectedTile(tile);
                          },
                        })
                      )}
                    </hstack>
                  );
                })}
                <spacer size="medium" />
                <hstack gap="small" alignment="center middle" grow>
                  {_renderTreasureBoxes()}
                </hstack>
                <spacer size="medium" />
                <button
                  appearance="primary"
                  width="100%"
                  disabled={
                    selectedTile?.type != TileType.Sea ||
                    selectedTile?.status != TileStatus.Unexplored ||
                    isDiving
                  }
                  onPress={_dive}
                >
                  Dive
                </button>
              </vstack>
            </vstack>
          </zstack>
          <spacer size="small" />
        </vstack>
      )}

      <Compass />

      {systemMessage &&
        Modal({
          systemMessage: systemMessage,
          onPress: () => setSystemMessage(null),
        })}

      {isDiving && (
        <DiveProgress
          progress={diveProgress}
          totalDepth={selectedTile!.depth}
          onPress={() => {}}
        />
      )}

      {gameBoard.gameOver && <GameOver gameboard={gameBoard} />}
    </zstack>
  );
};

Devvit.addCustomPostType({
  name: "Experience Post",
  height: "tall",
  render: App,
});

export default Devvit;
