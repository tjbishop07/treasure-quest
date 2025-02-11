import { Devvit, useInterval, useState } from "@devvit/public-api";
import {
  GameBoard,
  SystemMessage,
  SystemMessageType,
  Tile,
  TileStatus,
  TileType,
} from "../utils/types.js";
import {
  diveCompletedMessage,
  getTreasureCount,
  updateTileStatus,
} from "../utils/board.js";
import { saveGameboard } from "../api/api.js";
import { diveErrorMessage } from "../utils/messages.js";

type DiveButtonProps = {
  gameBoard: GameBoard;
  selectedTile: Tile | null;
  context: Devvit.Context;
  username: string;
  postId: string;
  updateGameBoard: (gameBoard: GameBoard) => void;
  updateSelectedTile: (tile: Tile | null) => void;
  sendSystemMessage: (message: SystemMessage) => void;
};

export const DiveButton = (props: DiveButtonProps) => {
  const [diveProgress, setDiveProgress] = useState<number>(0);
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const depth = props.selectedTile?.depth || 0;

  const diveInterval = useInterval(async () => {
    setDiveProgress((prev) => {
      if (prev >= depth || props.gameBoard.airSupply <= 0) {
        diveInterval.stop();
        setIsDiving(false);
        _analyzeDiveResults();
        return 0;
      }

      const updatedAirSupply = props.gameBoard.airSupply - 1;
      props.updateGameBoard({
        ...props.gameBoard,
        airSupply: updatedAirSupply,
      });

      return prev + 1;
    });
  }, 100);

  const _analyzeDiveResults = async () => {
    if (!props.selectedTile) return;

    const updateGameBoard = updateTileStatus(
      props.gameBoard,
      props.selectedTile.coordinates,
      TileStatus.Explored
    );

    if (
      props.selectedTile.treasureValue &&
      props.selectedTile.treasureValue > 0 &&
      updateGameBoard.airSupply > 0
    ) {
      updateGameBoard.foundTreasureCount++;
      updateGameBoard.foundTreasureValue += props.selectedTile.treasureValue;
    }

    updateGameBoard.lastTileSelected = props.selectedTile;
    updateGameBoard.gameStarted = true;

    if (updateGameBoard.airSupply <= 0) {
      updateGameBoard.gameOverMessage = `You ran out of before finding all the treasure`;
      updateGameBoard.gameOver = true;
    } else {
      if (
        updateGameBoard.foundTreasureCount === getTreasureCount(updateGameBoard)
      ) {
        updateGameBoard.gameOverMessage = `You found all the treasure!`;
        updateGameBoard.gameOver = true;
      } else {
        const treasureValue = props.selectedTile.treasureValue || 0;
        props.sendSystemMessage({
          title: "Dive Complete!",
          message: diveCompletedMessage(updateGameBoard, treasureValue),
          type: SystemMessageType.Info,
          dismissable: true,
        });
      }
    }

    await saveGameboard(
      props.context.redis,
      props.username,
      props.postId,
      updateGameBoard
    );

    props.updateGameBoard(updateGameBoard);
    props.updateSelectedTile(null);
  };

  const _dive = async (): Promise<void> => {
    if (!props.selectedTile) {
      props.sendSystemMessage({
        message: diveErrorMessage,
        type: SystemMessageType.Error,
        dismissable: true,
      });
      return;
    }

    setIsDiving(true);
    diveInterval.start();
  };

  const currentProgress = (diveProgress / depth) * 100;

  return (
    <zstack width="100%">
      {isDiving && (
        <vstack cornerRadius="full" width="100%" height="40px">
          <hstack
            backgroundColor="KiwiGreen-400"
            width={`${currentProgress}%`}
            height="40px"
          >
            <spacer size="medium" shape="square" />
          </hstack>
        </vstack>
      )}
      <button
        appearance="primary"
        width="100%"
        disabled={
          props.selectedTile?.type != TileType.Sea ||
          props.selectedTile?.status != TileStatus.Unexplored ||
          isDiving
        }
        onPress={_dive}
      >
        {isDiving ? `Diving ${depth} meters...` : "Dive"}
      </button>
    </zstack>
  );
};
