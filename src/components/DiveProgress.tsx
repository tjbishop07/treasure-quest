import { Devvit } from "@devvit/public-api";
import { SystemMessage, SystemMessageType } from "../utils/types.js";

type DiveProgressProps = {
  progress: number;
  totalDepth: number;
  onPress: () => void | Promise<void>;
};

export const DiveProgress = (props: DiveProgressProps) => {
  const currentProgress = (props.progress / props.totalDepth) * 100;
  return (
    <zstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="rgba(0, 0, 0, 0.75)"
    >
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        <image
          url="diver.png"
          imageWidth={250}
          imageHeight={250}
          description="game background"
        />
        <spacer size="medium" />
        <text
          wrap
          alignment="center"
          weight="bold"
          size="xlarge"
          style="heading"
          color="white"
        >
          Diving to {props.totalDepth} meters...
        </text>
        <spacer size="medium" />

        <vstack backgroundColor="#FFD5C6" cornerRadius="full" width="100%">
          <hstack backgroundColor="global-coins" width={`${currentProgress}%`}>
            <spacer size="small" shape="square" />
          </hstack>
        </vstack>
      </vstack>
    </zstack>
  );
};
