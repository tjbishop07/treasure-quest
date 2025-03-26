import { Devvit, useState } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { getTreasureCount } from "../utils/board.js";
import { Columns } from "@devvit/kit";
import { Leaderboard } from "./Leaderboard.js";
import { Service } from "../api/Service.js";

type GameOverProps = {
  gameboard: GameBoard;
  service: Service;
  postId: string;
  username: string;
};

export const GameOver = (props: GameOverProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
      backgroundColor="rgba(0, 0, 0, 0.80)"
    >
      {showLeaderboard ? (
        <Leaderboard
          gameboard={props.gameboard}
          onClose={() => setShowLeaderboard(false)}
          service={props.service}
        />
      ) : (
        <vstack alignment="center middle" width="80%" maxWidth="300px">
          <text
            wrap
            alignment="center"
            weight="bold"
            size="xxlarge"
            style="heading"
            color="white"
          >
            GAME OVER
          </text>
          <spacer size="small" />
          <text wrap alignment="center" size="xlarge" color="white">
            {props.gameboard.gameOverMessage}
          </text>
          <spacer size="large" />
          <Columns columnCount={2} order="row" gapY="5px">
            <text size="xlarge">Coins Found:</text>
            <text size="xlarge" alignment="middle end">
              {props.gameboard.foundTreasureValue}
            </text>
            <text size="medium">Air Supply Bonus: </text>
            <text size="medium" alignment="middle end">
              {props.gameboard.airSupply > 0 ? props.gameboard.airSupply : 0}
            </text>
            <text size="medium">All Treasure Bonus:</text>
            <text size="medium" alignment="middle end">
              {_determineAllTreasureBonus()}
            </text>
            <spacer size="large" />
            <spacer size="large" />

            <text size="xxlarge" weight="bold" color="yellow">
              Final Score:
            </text>
            <text
              size="xxlarge"
              weight="bold"
              color="yellow"
              alignment="middle end"
            >
              {_calculateFinalScore()}
            </text>
          </Columns>
          <spacer size="large" />
          <button
            size="large"
            width="100%"
            appearance="primary"
            onPress={() => {
              setShowLeaderboard(true);
            }}
          >
            Leaderboard
          </button>
        </vstack>
      )}
    </zstack>
  );
};
