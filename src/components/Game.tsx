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
import { loadPlayerGameboard } from "../api/api.js";
import {
  startupMessage,
  tileExploredMessage,
  tileSelectionErrorMessage,
} from "../utils/messages.js";
import { Header } from "./Header.js";
import { GameBoardTile } from "./GameBoardTile.js";
import { Modal } from "./Modal.js";
import { DiveButton } from "./DiveButton.js";
import { GameOver } from "./GameOver.js";
import { TreasureBoxes } from "./TreasureBoxes.js";

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
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(
    () => {
      if (gameBoard.gameStarted) return null;
      return {
        title: "There's hidden treasure nearby!",
        message: startupMessage,
        type: SystemMessageType.Info,
        dismissable: true,
        buttonLabel: "Start Exploring!",
      };
    }
  );

  return (
    <zstack width="100%" height="100%" alignment="middle center">
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
        <vstack alignment="center middle">
          <zstack
            backgroundColor="rgba(19,31,35,1)"
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
                  <TreasureBoxes gameBoard={gameBoard} />
                </hstack>

                <spacer size="medium" />

                <DiveButton
                  gameBoard={gameBoard}
                  selectedTile={selectedTile}
                  context={context}
                  updateGameBoard={setGameBoard}
                  updateSelectedTile={setSelectedTile}
                  sendSystemMessage={setSystemMessage}
                  username={currentUserName ?? ""}
                  postId={context.postId ?? ""}
                />
              </vstack>
            </vstack>
          </zstack>
          <spacer size="small" />
        </vstack>
      )}

      {systemMessage &&
        Modal({
          systemMessage: systemMessage,
          onPress: () => setSystemMessage(null),
        })}

      {gameBoard.gameOver && <GameOver gameboard={gameBoard} />}
    </zstack>
  );
};
