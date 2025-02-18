import { Devvit } from "@devvit/public-api";
import { GameBoard } from "../utils/types.js";
import { getTreasureCount } from "../utils/board.js";
import { Columns } from "@devvit/kit";

type WelcomeProps = {
  username: String | null;
  onDismiss: () => void | Promise<void>;
};

export const Welcome = (props: WelcomeProps) => {
  return (
    <zstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="rgba(0, 0, 0, 0.80)"
    >
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        <text
          wrap
          alignment="center"
          weight="bold"
          size="xxlarge"
          style="heading"
          color="white"
        >
          Hey {props.username}, there is hidden treasure nearby!
        </text>
        <spacer size="small" />
        <spacer size="large" />
        <text wrap alignment="center" size="xlarge" color="white">
          Do you have what it takes to find it all before your oxygen runs out?
        </text>
        <spacer size="large" />
        <button
          width="100%"
          appearance="secondary"
          onPress={() => props.onDismiss()}
        >
          Start Exploring!
        </button>
      </vstack>
    </zstack>
  );
};
