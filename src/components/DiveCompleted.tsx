import { Devvit } from "@devvit/public-api";
import { GameBoard, Tile } from "../utils/types.js";
import { Columns } from "@devvit/kit";
import { getTreasureHint } from "../utils/board.js";

type DiveCompletedProps = {
  gameboard: GameBoard;
  resetDiveCompleted: () => void;
};

export const DiveCompleted = (props: DiveCompletedProps) => {
  if (!props.gameboard.lastTileSelected) {
    return null;
  }

  return (
    <zstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="rgba(0, 0, 0, 0.90)"
    >
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        <vstack alignment="center" width="100%">
          <image
            url="compass.png"
            imageWidth={150}
            imageHeight={150}
            resizeMode="fit"
            description="compass"
          />
        </vstack>
        <spacer size="large" />
        <text
          wrap
          alignment="center"
          weight="bold"
          size="xxlarge"
          style="heading"
          color="white"
        >
          Dive Completed!
        </text>
        <spacer size="small" />
        <text wrap alignment="center" size="xlarge" color="white">
          {getTreasureHint(
            props.gameboard.lastTileSelected,
            props.gameboard.rows[
              props.gameboard.lastTileSelected.coordinates.x
            ],
            props.gameboard.lastTileSelected?.treasureValue || 0
          )}
        </text>
        <spacer size="large" />
        <Columns columnCount={2} order="row" gapY="5px">
          <text size="large" weight="bold" color="gold">
            You Found:
          </text>
          <text size="large" weight="bold" color="gold" alignment="middle end">
            ${props.gameboard.lastTileSelected?.treasureValue || 0}
          </text>
        </Columns>
        <spacer size="large" />
        <button
          size="large"
          width="100%"
          appearance="primary"
          onPress={props.resetDiveCompleted}
        >
          Continue
        </button>
      </vstack>
    </zstack>
  );
};
