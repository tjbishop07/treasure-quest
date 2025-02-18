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
import { Service } from "../api/Service.js";
import { diveErrorMessage } from "../utils/messages.js";

type DiveButtonProps = {
  gameBoard: GameBoard;
  selectedTile: Tile | null;
  service: Service;
  username: string | null;
  postId: string | null;
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
    if (!props.selectedTile || !props.postId || !props.username)
      throw new Error("Invalid game state when trying to analyze dive results");

    const updatedGameBoard = updateTileStatus(
      props.gameBoard,
      props.selectedTile.coordinates,
      TileStatus.Explored
    );

    if (
      props.selectedTile.treasureValue &&
      props.selectedTile.treasureValue > 0 &&
      updatedGameBoard.airSupply > 0
    ) {
      updatedGameBoard.foundTreasureCount++;
      updatedGameBoard.foundTreasureValue += props.selectedTile.treasureValue;
    }

    updatedGameBoard.lastTileSelected = props.selectedTile;
    updatedGameBoard.gameStarted = true;

    if (updatedGameBoard.airSupply <= 0) {
      updatedGameBoard.gameOverMessage = `Oh no! You ran out of air!`;
      updatedGameBoard.gameOver = true;
    } else {
      if (
        updatedGameBoard.foundTreasureCount ===
        getTreasureCount(updatedGameBoard)
      ) {
        updatedGameBoard.gameOverMessage = `You found all the treasure!`;
        updatedGameBoard.gameOver = true;
      } else {
        const treasureValue = props.selectedTile.treasureValue || 0;
        props.sendSystemMessage({
          title: "Dive Complete!",
          message: diveCompletedMessage(updatedGameBoard, treasureValue),
          type: SystemMessageType.Info,
          dismissable: true,
        });
      }
    }

    updatedGameBoard.lastMoveTimestamp = new Date().getTime();
    props.updateGameBoard(updatedGameBoard);
    props.updateSelectedTile(null);
    props.service.saveGameboard(props.username, props.postId, updatedGameBoard);
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
