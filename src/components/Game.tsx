import { Devvit, Context, useState, useAsync } from "@devvit/public-api";
import {
  GameBoard,
  Row,
  SystemMessage,
  SystemMessageType,
  Tile,
  TileStatus,
  TileType,
} from "../utils/types.js";
import { Service } from "../api/Service.js";
import {
  tileExploredMessage,
  tileSelectionErrorMessage,
} from "../utils/messages.js";
import { Header } from "./Header.js";
import { GameBoardTile } from "./GameBoardTile.js";
import { Modal } from "./Modal.js";
import { DiveButton } from "./DiveButton.js";
import { GameOver } from "./GameOver.js";
import { Welcome } from "./Welcome.js";

export const Game: Devvit.CustomPostComponent = (context: Context) => {
  const service = new Service(context.redis);
  const postId = context.postId ?? null;

  const { data: username } = useAsync(async () => {
    const user = await context.reddit.getCurrentUser();
    return user?.username ?? null;
  });

  const [gameBoard, setGameBoard] = useState<GameBoard | null>(async () => {
    const user = await context.reddit.getCurrentUser();
    if (!user?.username) return null;
    return await service.loadPlayerGameboard(user.username, postId);
  });

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(
    null
  );

  const handleStartGame = async () => {
    if (!gameBoard) return;
    setGameBoard({ ...gameBoard, gameStarted: true });
  };

  const handleTileSelection = async (tile: Tile) => {
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
        message: tileExploredMessage(tile.treasureValue),
        type: SystemMessageType.Error,
        dismissable: true,
      });
      setSelectedTile(null);
      return;
    }

    setSystemMessage(null);
    setSelectedTile(tile);
  };

  if (!gameBoard) return <text>Loading...</text>;

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

      {!gameBoard?.gameStarted ? (
        <Welcome username={username} onDismiss={handleStartGame} />
      ) : (
        <vstack alignment="center middle">
          <zstack
            backgroundColor="rgba(19,31,35,.90)"
            padding="small"
            height="100%"
            alignment="middle center"
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
                {gameBoard.rows.map((row: Row, rowIndex: number) => (
                  <hstack key={rowIndex.toString()}>
                    {row.tiles.map((tile: Tile, tileIndex: number) => (
                      <GameBoardTile
                        key={`${rowIndex}-${tileIndex}`}
                        selected={selectedTile === tile}
                        type={tile.type}
                        status={tile.status}
                        hasTreasure={tile.treasureValue > 0}
                        depth={tile.depth}
                        onPress={() => handleTileSelection(tile)}
                      />
                    ))}
                  </hstack>
                ))}

                <spacer size="small" />

                <DiveButton
                  gameBoard={gameBoard}
                  selectedTile={selectedTile}
                  service={service}
                  updateGameBoard={setGameBoard}
                  updateSelectedTile={setSelectedTile}
                  sendSystemMessage={setSystemMessage}
                  username={username}
                  postId={postId}
                />
              </vstack>
            </vstack>
          </zstack>
        </vstack>
      )}

      {systemMessage && (
        <Modal
          systemMessage={systemMessage}
          onDismiss={() => setSystemMessage(null)}
        />
      )}
      {gameBoard?.gameOver && <GameOver gameboard={gameBoard} />}
    </zstack>
  );
};
