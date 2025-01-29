import { Devvit } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { getTreasureCount } from "../utils/board.js";

type GameOverProps = {
  gameboard: GameBoard;
};

export const GameOver = (props: GameOverProps) => {
  const _calculateFinalScore = () => {
    const airSupplyBonus =
      props.gameboard.airSupply > 0 ? props.gameboard.airSupply : 0;

    return (
      props.gameboard.foundTreasureValue +
      airSupplyBonus +
      _determineAllTreasureBonus()
    );
  };

  const _determineAllTreasureBonus = () => {
    const totalTreasureCount = getTreasureCount(props.gameboard);
    return props.gameboard.foundTreasureCount === totalTreasureCount ? 100 : 0;
  };

  return (
    <zstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="rgba(0, 0, 0, 0.95)"
    >
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        <text
          wrap
          alignment="center"
          weight="bold"
          size="xlarge"
          style="heading"
          color="white"
        >
          GAME OVER
        </text>
        <text wrap alignment="center" size="large" color="white">
          {props.gameboard.gameOverMessage}
        </text>
        <spacer size="large" />
        <vstack>
          <text>Coins Found: {props.gameboard.foundTreasureValue}</text>
          <text>
            Air Supply Bonus:{" "}
            {props.gameboard.airSupply > 0 ? props.gameboard.airSupply : 0}
          </text>
          <text>All Treasure Bonus: {_determineAllTreasureBonus()}</text>
        </vstack>
        <spacer size="large" />
        <text size="xlarge" weight="bold" color="yellow">
          Final Score: {_calculateFinalScore()}
        </text>
      </vstack>
    </zstack>
  );
};
