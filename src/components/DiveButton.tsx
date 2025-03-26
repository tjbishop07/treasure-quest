import { Devvit, useInterval, useState } from "@devvit/public-api";
import {
  GameBoard,
  SystemMessage,
  SystemMessageType,
  Tile,
  TileStatus,
  TileType,
} from "../utils/types.js";
import { getTreasureCount, updateTileStatus } from "../utils/board.js";
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
  diveCompleted: () => void;
};

export const DiveButton = ({
  gameBoard,
  selectedTile,
  service,
  username,
  postId,
  updateGameBoard,
  updateSelectedTile,
  sendSystemMessage,
  diveCompleted,
}: DiveButtonProps) => {
  const [diveProgress, setDiveProgress] = useState<number>(0);
  const [isDiving, setIsDiving] = useState<boolean>(false);
  const depth = selectedTile?.depth || 0;

  const handleDiveComplete = async () => {
    if (!selectedTile || !postId || !username) {
      throw new Error("Invalid game state when trying to analyze dive results");
    }

    const updatedGameBoard = updateTileStatus(
      gameBoard,
      selectedTile.coordinates,
      TileStatus.Explored
    );

    if (selectedTile.treasureValue > 0 && updatedGameBoard.airSupply > 0) {
      updatedGameBoard.foundTreasureCount++;
      updatedGameBoard.foundTreasureValue += selectedTile.treasureValue;
    }

    updatedGameBoard.lastTileSelected = selectedTile;
    updatedGameBoard.gameStarted = true;
    updatedGameBoard.lastMoveTimestamp = new Date().getTime();

    if (updatedGameBoard.airSupply <= 0) {
      updatedGameBoard.gameOverMessage = `Oh no! You ran out of air!`;
      updatedGameBoard.gameOver = true;
    } else if (
      updatedGameBoard.foundTreasureCount === getTreasureCount(updatedGameBoard)
    ) {
      updatedGameBoard.gameOverMessage = `You found all the treasure!`;
      updatedGameBoard.gameOver = true;
    }

    if (updatedGameBoard.gameOver) {
      const airSupplyBonus =
        updatedGameBoard.airSupply > 0 ? updatedGameBoard.airSupply : 0;

      const treasureBonus =
        updatedGameBoard.foundTreasureCount ===
        getTreasureCount(updatedGameBoard)
          ? 100
          : 0;

      const finalScore =
        updatedGameBoard.foundTreasureValue + airSupplyBonus + treasureBonus;

      service.updateDailyLeaderboard(
        username,
        finalScore,
        updatedGameBoard.gameNumber
      );
    }

    updateGameBoard(updatedGameBoard);
    service.saveGameboard(username, postId, updatedGameBoard);
    diveCompleted();
  };

  const diveInterval = useInterval(async () => {
    setDiveProgress((prev) => {
      if (prev >= depth || gameBoard.airSupply <= 0) {
        diveInterval.stop();
        setIsDiving(false);
        handleDiveComplete();
        return 0;
      }

      updateGameBoard({
        ...gameBoard,
        airSupply: gameBoard.airSupply - 1,
      });

      return prev + 1;
    });
  }, 1);

  const handleDive = async () => {
    if (!selectedTile) {
      sendSystemMessage({
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
  const isDisabled =
    selectedTile?.type !== TileType.Sea ||
    selectedTile?.status !== TileStatus.Unexplored ||
    isDiving;

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
        disabled={isDisabled}
        onPress={handleDive}
      >
        {isDiving ? `Diving ${depth} meters...` : "Dive"}
      </button>
    </zstack>
  );
};
