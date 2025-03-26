import { Devvit } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { TreasureBoxes } from "./TreasureBoxes.js";

type HeaderProps = {
  gameBoard: GameBoard;
};

export const Header = (props: HeaderProps) => {
  const oxygenRemaining = (props.gameBoard.airSupply / 1500) * 100;

  return (
    <vstack width="100%">
      <hstack
        width="100%"
        gap="medium"
        alignment="middle start"
        padding="small"
      >
        <text style="heading" size="xlarge" weight="bold" color="white">
          ${props.gameBoard.foundTreasureValue}
        </text>
        <hstack alignment="bottom end" gap="small" grow>
          <TreasureBoxes gameBoard={props.gameBoard} />
        </hstack>
      </hstack>
      <spacer size="small" />
      <vstack
        cornerRadius="full"
        width="100%"
        height="20px"
        backgroundColor="rgba(255, 255, 255, 0.1)"
      >
        <hstack
          backgroundColor={
            oxygenRemaining > 50 ? "LightBlue-400" : "YellowOrange-400"
          }
          width={`${oxygenRemaining}%`}
          height="20px"
        >
          <vstack height="100%" width="100%" alignment="middle center">
            <text size="small" weight="bold" color="LightBlue-800">
              {oxygenRemaining > 30 ? "Oxygen:" : ""}{" "}
              {oxygenRemaining > 10 ? `${oxygenRemaining.toFixed(0)}%` : ""}
            </text>
          </vstack>
          <spacer size="medium" shape="square" />
        </hstack>
      </vstack>
    </vstack>
  );
};
