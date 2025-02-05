import { Devvit } from "@devvit/public-api";
import { GameBoard, SystemMessage, SystemMessageType } from "../utils/types.js";
import { getTreasureCount } from "../utils/board.js";

type TreasureBoxesProps = {
  gameBoard: GameBoard;
};

export const TreasureBoxes = (props: TreasureBoxesProps) => {
  const notFoundTreasureCount =
    getTreasureCount(props.gameBoard) - props.gameBoard.foundTreasureCount;

  const foundCoins = [];
  const notFoundCoins = [];

  for (let i = 0; i < props.gameBoard.foundTreasureCount; i++) {
    foundCoins.push(<icon name="coins" color="yellow" size="xsmall" />);
  }

  for (let i = 0; i < notFoundTreasureCount; i++) {
    notFoundCoins.push(
      <icon name="coins" color="rgba(255,255,255,.25)" size="xsmall" />
    );
  }

  return [...foundCoins, ...notFoundCoins];
};
