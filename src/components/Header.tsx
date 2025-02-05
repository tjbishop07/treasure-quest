import { Columns } from "@devvit/kit";
import { Devvit } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";

type HeaderProps = {
  gameBoard: GameBoard;
};

export const Header = (props: HeaderProps) => {
  return (
    <Columns columnCount={2} order="row">
      <hstack alignment="bottom start">
        <vstack alignment="middle start">
          <text style="heading" size="xlarge" weight="bold" outline="thin">
            {props.gameBoard.airSupply}m
          </text>
          <text size="medium" weight="bold" color="rgba(255, 255, 255, 0.5)">
            Air Left
          </text>
        </vstack>
      </hstack>
      <hstack alignment="bottom end">
        <vstack alignment="middle end">
          <text style="heading" size="xlarge" weight="bold" outline="thin">
            {props.gameBoard.foundTreasureValue}
          </text>
          <text size="medium" weight="bold" color="rgba(255, 255, 255, 0.5)">
            Coins Found
          </text>
        </vstack>
      </hstack>
    </Columns>
  );
};
