import { Devvit, useState } from "@devvit/public-api";
import { GameBoard, LeaderboardItem } from "../utils/types.js";
import { Service } from "../api/Service.js";
import { Columns } from "@devvit/kit";

type LeaderboardProps = {
  gameboard: GameBoard;
  onClose: () => void;
  service: Service;
};

export const Leaderboard = (props: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[] | null>(
    async () => {
      const leaderboard = await props.service.getDailyLeaderboard(
        props.gameboard.gameNumber
      );

      return leaderboard;
    }
  );

  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        <text
          wrap
          alignment="center"
          weight="bold"
          size="xxlarge"
          style="heading"
          color="white"
        >
          LEADERBOARD
        </text>
        <spacer size="large" />
        {leaderboard?.map((item, index) => (
          <Columns columnCount={2} order="row" gapY="5px">
            <text size="medium" weight="bold" color="white">
              {index + 1}. {item.member}
            </text>
            <text
              size="medium"
              weight="bold"
              color="gold"
              alignment="middle end"
            >
              {item.score}
            </text>
          </Columns>
        )) || null}
        <spacer size="large" />
        <button
          size="large"
          width="100%"
          appearance="primary"
          onPress={props.onClose}
        >
          Close
        </button>
      </vstack>
    </zstack>
  );
};
