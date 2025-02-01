import { Devvit, Context, useState, useInterval } from "@devvit/public-api";
import {
  GameBoard,
  Row,
  SystemMessage,
  SystemMessageType,
  Tile,
  TileStatus,
  TileType,
} from "../utils/types.js";
import { loadPlayerGameboard, saveGameboard } from "../api/api.js";
import {
  diveErrorMessage,
  startupMessage,
  tileExploredMessage,
  tileSelectionErrorMessage,
} from "../utils/messages.js";
import {
  diveCompletedMessage,
  getTreasureCount,
  updateTileStatus,
} from "../utils/board.js";
import { Header } from "./Header.js";
import { GameBoardTile } from "./GameBoardTile.js";
import { Compass } from "./Compass.js";
import { Modal } from "./Modal.js";
import { DiveProgress } from "./DiveProgress.js";
import { GameOver } from "./GameOver.js";
import { devAction, DevToolbarWrapper } from "@devvit/kit";

export const Game: Devvit.CustomPostComponent = (context: Context) => {
  const [currentUserName] = useState<string | null>(async () => {
    if (!context.userId) {
      return null;
    }
    const user = await context.reddit.getCurrentUsername();
    return user || null;
  });

  const [gameBoard, setGameBoard] = useState<GameBoard>(async () => {
    const gameBoard = await loadPlayerGameboard(
      context.redis,
      currentUserName ?? "",
      context.postId ?? ""
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

    await saveGameboard(
      context.redis,
      currentUserName || "",
      context.postId ?? "",
      updateGameBoard
    );

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

  const revealPostId = devAction("Reveal Post Id", () => {
    const postId = context.postId;
    context.ui.showToast(String(postId));
  });

  return (
    <DevToolbarWrapper
      context={context}
      allowedUserString="sixt0o"
      actions={[revealPostId]}
    >
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
    </DevToolbarWrapper>
  );
};
